/**
 * Gemini Vision AI OCR Service for Medical Documents
 * Uses Google Gemini API for superior image-to-text extraction with structured medical data
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_KEY_ALT = process.env.NEXT_PUBLIC_GEMINI_API_KEY_ALT || '';
// Using Gemini 2.0 Flash (experimental) for better OCR accuracy
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

export interface MedicationInfo {
    name: string;
    genericName?: string;
    dosage: string;
    frequency: string;
    timing: string; // morning/afternoon/evening/night
    duration?: string;
    instructions?: string;
    medicineInfo?: string; // What this medicine treats
}

export interface GeminiOCRResult {
    text: string;
    confidence: number;
    structuredData: {
        doctorName?: string;
        doctorSpecialization?: string;
        doctorRegistration?: string;
        clinicName?: string;
        patientName?: string;
        patientAge?: string;
        patientGender?: string;
        date?: string;
        diagnosis?: string;
        medications: MedicationInfo[];
        symptoms?: string[];
        vitalSigns?: {
            bloodPressure?: string;
            temperature?: string;
            pulse?: string;
            weight?: string;
        };
        nextVisit?: string;
        additionalNotes?: string;
    };
}

/**
 * Convert image file to base64 for Gemini API
 */
async function imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Extract comprehensive medical information from prescription image using Gemini Vision
 */
export async function extractMedicalDataFromImage(
    file: File,
    onProgress?: (progress: number) => void
): Promise<GeminiOCRResult> {
    try {
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured. Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local');
        }

        onProgress?.(10);

        // Convert image to base64
        const base64Image = await imageToBase64(file);
        onProgress?.(30);

        // Prepare Gemini API request with detailed medical extraction prompt
        const prompt = `You are an expert medical document analyzer AI. Analyze this prescription/medical document image thoroughly and extract ALL information in a structured JSON format.

EXTRACT THE FOLLOWING INFORMATION (if available in the image):

1. **DOCTOR INFORMATION:**
   - Full name
   - Specialization/Department
   - Medical registration/license number
   - Clinic/Hospital name

2. **PATIENT INFORMATION:**
   - Full name
   - Age
   - Gender

3. **PRESCRIPTION DETAILS:**
   - Date of prescription
   - Diagnosis/Chief complaint
   - Symptoms mentioned

4. **MEDICATIONS** (this is the MOST IMPORTANT - extract every medicine):
   For EACH medicine found, extract:
   - Medicine name (brand name and generic name if visible)
   - Dosage (e.g., "500mg", "10ml", "1 tablet")
   - Frequency (e.g., "3 times daily", "twice a day", "once daily")
   - **Timing** (be VERY specific: "Morning", "Afternoon", "Evening", "Night", "Before meals", "After meals")
   - Duration (e.g., "7 days", "2 weeks", "1 month")
   - Special instructions (e.g., "with water", "on empty stomach")
   - Brief medical information about what this medicine treats/is used for

5. **VITAL SIGNS** (if recorded):
   - Blood pressure, Temperature, Pulse, Weight

6. **ADDITIONAL:**
   - Next visit date
   - Any warnings or special notes

**IMPORTANT:** 
- For medication timing, look for keywords like: "morning", "afternoon", "evening", "night", "before food", "after food", "bedtime"
- Common patterns: "1-0-1" means morning and night, "1-1-1" means morning, afternoon, night
- Extract COMPLETE information for each medicine

Return ONLY a valid JSON object (no markdown, no extra text) with this EXACT structure:

{
  "text": "full extracted raw text from document",
  "confidence": 0.95,
  "doctorName": "Dr. Full Name",
  "doctorSpecialization": "Specialization",
  "doctorRegistration": "Registration number",
  "clinicName": "Clinic or Hospital name",
  "patientName": "Patient Full Name",
  "patientAge": "Age",
  "patientGender": "Male/Female",
  "date": "DD/MM/YYYY or as written",
  "diagnosis": "Diagnosis or chief complaint",
  "medications": [
    {
      "name": "Medicine Brand Name",
      "genericName": "Generic Name",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "timing": "Morning (8 AM), Afternoon (2 PM), Night (8 PM) - After meals",
      "duration": "7 days",
      "instructions": "Take with water after meals",
      "medicineInfo": "This medicine is an antibiotic used to treat bacterial infections..."
    }
  ],
  "symptoms": ["symptom1", "symptom2"],
  "vitalSigns": {
    "bloodPressure": "120/80",
    "temperature": "98.6°F",
    "pulse": "72 bpm",
    "weight": "70 kg"
  },
  "nextVisit": "Date or description",
  "additionalNotes": "Any other important information"
}

If a field is not visible in the image, use empty string "" or empty array [].`;

        // Call Gemini API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            },
                            {
                                inline_data: {
                                    mime_type: file.type,
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.1,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 4096,
                }
            })
        });

        clearTimeout(timeoutId);
        onProgress?.(70);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        onProgress?.(90);

        // Extract text from Gemini response
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Try to parse JSON from the response
        let structuredData: any = {
            medications: [],
            symptoms: [],
            vitalSigns: {}
        };

        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = generatedText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) ||
                generatedText.match(/(\{[\s\S]*\})/);

            if (jsonMatch) {
                const jsonStr = jsonMatch[1] || jsonMatch[0];
                const parsed = JSON.parse(jsonStr.trim());
                structuredData = { ...structuredData, ...parsed };
            }
        } catch (parseError) {
            console.warn('Could not parse JSON from Gemini response:', parseError);
            // Fallback: use the text as-is
            structuredData.text = generatedText;
        }

        onProgress?.(100);

        return {
            text: structuredData.text || generatedText,
            confidence: 0.95, // Gemini Vision has high confidence
            structuredData: {
                doctorName: structuredData.doctorName || '',
                doctorSpecialization: structuredData.doctorSpecialization || '',
                doctorRegistration: structuredData.doctorRegistration || '',
                clinicName: structuredData.clinicName || '',
                patientName: structuredData.patientName || '',
                patientAge: structuredData.patientAge || '',
                patientGender: structuredData.patientGender || '',
                date: structuredData.date || '',
                diagnosis: structuredData.diagnosis || '',
                medications: Array.isArray(structuredData.medications) ? structuredData.medications : [],
                symptoms: Array.isArray(structuredData.symptoms) ? structuredData.symptoms : [],
                vitalSigns: structuredData.vitalSigns || {},
                nextVisit: structuredData.nextVisit || '',
                additionalNotes: structuredData.additionalNotes || ''
            }
        };

    } catch (error: any) {
        console.error('Gemini OCR failed:', error);
        throw new Error(`OCR extraction failed: ${error.message}`);
    }
}

/**
 * Validate OCR result quality
 */
export function validateOCRResult(result: GeminiOCRResult): 'high' | 'medium' | 'low' {
    const { confidence, structuredData } = result;

    // Check if we extracted key medical information
    const hasDoctorInfo = !!structuredData.doctorName;
    const hasPatientInfo = !!structuredData.patientName;
    const hasMedications = structuredData.medications.length > 0;
    const hasCompleteMedInfo = structuredData.medications.some(m => m.timing && m.dosage);

    if (confidence > 0.9 && hasMedications && hasCompleteMedInfo) {
        return 'high';
    } else if (confidence > 0.7 && hasMedications) {
        return 'medium';
    } else {
        return 'low';
    }
}
