/**
 * Medical NLP & Prescription Understanding
 * Uses GPT-4 to extract medical information from text
 */

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface MedicalInfo {
    medications: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
    }>;
    diagnosis: string[];
    doctorName: string;
    date: string;
    patientName: string;
    instructions: string[];
    category: 'prescription' | 'report' | 'scan' | 'vaccine' | 'other';
}

/**
 * Parse prescription text using GPT
 */
export async function parsePrescription(
    ocrText: string
): Promise<MedicalInfo> {
    try {
        const prompt = `You are a medical text parser. Extract structured information from this prescription/medical document.

OCR Text:
${ocrText}

Extract and return ONLY valid JSON (no markdown, no explanations) with this exact structure:
{
  "medications": [{"name": "string", "dosage": "string", "frequency": "string", "duration": "string"}],
  "diagnosis": ["string"],
  "doctorName": "string",
  "date": "YYYY-MM-DD",
  "patientName": "string",
  "instructions": ["string"],
  "category": "prescription|report|scan|vaccine|other"
}

Rules:
- If a field is not found, use empty string "" or empty array []
- Date format must be YYYY-MM-DD
- Category must be one of: prescription, report, scan, vaccine, other
- Return ONLY the JSON object`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Cost-effective for hackathon
            messages: [
                {
                    role: 'system',
                    content: 'You are a medical document parser. Return only valid JSON.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3, // Low temperature for consistent parsing
            max_tokens: 1000,
        });

        const content = response.choices[0]?.message?.content || '{}';

        // Remove markdown code blocks if present
        const jsonContent = content
            .replace(/```json\n/g, '')
            .replace(/```\n/g, '')
            .replace(/```/g, '')
            .trim();

        const parsed = JSON.parse(jsonContent);

        console.log('✅ Prescription parsed:', parsed);

        return parsed as MedicalInfo;
    } catch (error: any) {
        console.error('❌ Prescription parsing failed:', error);

        // Return default structure on error
        return {
            medications: [],
            diagnosis: [],
            doctorName: '',
            date: '',
            patientName: '',
            instructions: [],
            category: 'other',
        };
    }
}

/**
 * Generate health summary from multiple records
 */
export async function generateHealthSummary(
    medicalRecords: MedicalInfo[]
): Promise<string> {
    try {
        const recordsSummary = medicalRecords
            .map((record, index) => {
                return `Record ${index + 1}:
Category: ${record.category}
Date: ${record.date}
Diagnosis: ${record.diagnosis.join(', ')}
Medications: ${record.medications.map(m => `${m.name} (${m.dosage})`).join(', ')}`;
            })
            .join('\n\n');

        const prompt = `Generate a concise patient health summary (max 200 words) from these medical records:

${recordsSummary}

Focus on:
1. Current medications
2. Ongoing conditions
3. Recent diagnoses
4. Important medical history

Write in clear, patient-friendly language.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a medical assistant creating patient summaries.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.5,
            max_tokens: 300,
        });

        const summary = response.choices[0]?.message?.content || 'No summary available.';

        console.log('✅ Health summary generated');

        return summary;
    } catch (error: any) {
        console.error('❌ Summary generation failed:', error);
        return 'Unable to generate health summary at this time.';
    }
}

/**
 * Extract medication information
 */
export function extractMedications(medicalInfo: MedicalInfo): string[] {
    return medicalInfo.medications.map(
        med => `${med.name} - ${med.dosage} ${med.frequency}`
    );
}

/**
 * Categorize medical document
 */
export async function categorizeMedicalDocument(
    text: string
): Promise<'prescription' | 'report' | 'scan' | 'vaccine' | 'other'> {
    const lowerText = text.toLowerCase();

    // Simple rule-based categorization
    if (
        lowerText.includes('prescription') ||
        lowerText.includes('rx') ||
        lowerText.includes('medication')
    ) {
        return 'prescription';
    }

    if (
        lowerText.includes('blood test') ||
        lowerText.includes('lab report') ||
        lowerText.includes('test results')
    ) {
        return 'report';
    }

    if (
        lowerText.includes('x-ray') ||
        lowerText.includes('mri') ||
        lowerText.includes('ct scan') ||
        lowerText.includes('ultrasound')
    ) {
        return 'scan';
    }

    if (
        lowerText.includes('vaccine') ||
        lowerText.includes('vaccination') ||
        lowerText.includes('immunization')
    ) {
        return 'vaccine';
    }

    return 'other';
}

/**
 * Validate medical information
 */
export function validateMedicalInfo(info: MedicalInfo): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (info.medications.length === 0 && info.diagnosis.length === 0) {
        errors.push('No medical information extracted');
    }

    if (info.medications.some(m => !m.name || !m.dosage)) {
        errors.push('Incomplete medication information');
    }

    if (info.date && !/^\d{4}-\d{2}-\d{2}$/.test(info.date)) {
        errors.push('Invalid date format');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Generate medication reminder text
 */
export function generateMedicationReminder(
    medication: {
        name: string;
        dosage: string;
        frequency: string;
    }
): string {
    return `Remember to take ${medication.name} (${medication.dosage}) - ${medication.frequency}`;
}
