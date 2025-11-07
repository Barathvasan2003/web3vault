/**
 * AI-Powered Medical OCR
 * Extract text from prescription images and medical documents
 */

import Tesseract from 'tesseract.js';

/**
 * Extract text from image using Tesseract OCR
 */
export async function extractTextFromImage(
    imageFile: File,
    onProgress?: (progress: number) => void
): Promise<{
    text: string;
    confidence: number;
    words: Array<{
        text: string;
        confidence: number;
        bbox: { x0: number; y0: number; x1: number; y1: number };
    }>;
}> {
    try {
        console.log('🔍 Starting OCR on:', imageFile.name);

        const result = await Tesseract.recognize(
            imageFile,
            'eng', // Language
            {
                logger: (m: any) => {
                    if (m.status === 'recognizing text' && onProgress) {
                        onProgress(Math.round(m.progress * 100));
                    }
                },
            }
        );

        console.log('✅ OCR complete. Confidence:', result.data.confidence);

        return {
            text: result.data.text,
            confidence: result.data.confidence,
            words: result.data.words.map((word: any) => ({
                text: word.text,
                confidence: word.confidence,
                bbox: word.bbox,
            })),
        };
    } catch (error: any) {
        console.error('❌ OCR failed:', error);
        throw new Error(`OCR extraction failed: ${error.message}`);
    }
}

/**
 * Preprocess image for better OCR results
 */
export function preprocessImageForOCR(imageFile: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

        img.onload = () => {
            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Convert to grayscale and increase contrast
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

                // Increase contrast
                const contrast = 1.5;
                const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                const adjusted = factor * (gray - 128) + 128;

                data[i] = data[i + 1] = data[i + 2] = adjusted;
            }

            // Put modified image back
            ctx.putImageData(imageData, 0, 0);

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const processedFile = new File([blob], imageFile.name, {
                        type: 'image/png',
                    });
                    resolve(processedFile);
                } else {
                    reject(new Error('Failed to process image'));
                }
            });
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(imageFile);
    });
}

/**
 * Detect if file is an image
 */
export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

/**
 * Extract text from PDF (requires PDF.js)
 */
export async function extractTextFromPDF(pdfFile: File): Promise<string> {
    // For hackathon MVP, we'll prompt user to convert PDF to images
    // Full implementation would use PDF.js
    throw new Error(
        'PDF text extraction: Please convert PDF pages to images for OCR'
    );
}

/**
 * Validate OCR results
 */
export function validateOCRResult(result: {
    text: string;
    confidence: number;
}): {
    isValid: boolean;
    quality: 'high' | 'medium' | 'low';
    suggestions: string[];
} {
    const suggestions: string[] = [];
    let quality: 'high' | 'medium' | 'low' = 'high';

    // Check confidence
    if (result.confidence < 50) {
        quality = 'low';
        suggestions.push('Image quality is low. Try better lighting or higher resolution.');
    } else if (result.confidence < 75) {
        quality = 'medium';
        suggestions.push('Consider retaking photo with better focus.');
    }

    // Check if text was extracted
    if (!result.text || result.text.trim().length < 10) {
        suggestions.push('Very little text detected. Ensure document is clearly visible.');
        return { isValid: false, quality: 'low', suggestions };
    }

    return {
        isValid: result.confidence > 50,
        quality,
        suggestions,
    };
}

/**
 * Clean OCR text (remove common OCR errors)
 */
export function cleanOCRText(text: string): string {
    return text
        .replace(/\s+/g, ' ') // Multiple spaces to single
        .replace(/[|l1]/g, 'I') // Common OCR mistakes
        .replace(/[O0]/g, 'O') // Zero vs O
        .trim();
}
