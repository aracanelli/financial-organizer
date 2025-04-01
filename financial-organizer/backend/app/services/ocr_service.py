import os
from typing import Dict, Any, Optional
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
from pyzbar.pyzbar import decode
import json

from app.core.config import settings

class OCRService:
    @staticmethod
    async def process_receipt(file_path: str) -> Dict[str, Any]:
        """
        Process a receipt image or PDF and extract relevant information.
        """
        try:
            # Convert PDF to image if necessary
            if file_path.lower().endswith('.pdf'):
                images = convert_from_path(file_path)
                image = images[0]  # Process first page only
            else:
                image = Image.open(file_path)

            # Extract text using Tesseract OCR
            text = pytesseract.image_to_string(image)
            
            # Try to decode barcodes if present
            barcodes = decode(image)
            barcode_data = [barcode.data.decode('utf-8') for barcode in barcodes] if barcodes else []

            # Parse the extracted text
            parsed_data = OCRService._parse_receipt_text(text)
            
            # Add barcode data if found
            if barcode_data:
                parsed_data['barcodes'] = barcode_data

            return parsed_data

        except Exception as e:
            raise Exception(f"Error processing receipt: {str(e)}")

    @staticmethod
    def _parse_receipt_text(text: str) -> Dict[str, Any]:
        """
        Parse the extracted text to identify key information.
        """
        lines = text.split('\n')
        parsed_data = {
            'merchant_name': None,
            'date': None,
            'items': [],
            'total': None,
            'tax': None,
            'subtotal': None
        }

        for line in lines:
            line = line.strip()
            
            # Skip empty lines
            if not line:
                continue

            # Try to identify merchant name (usually at the top)
            if not parsed_data['merchant_name']:
                parsed_data['merchant_name'] = line

            # Try to identify date
            if not parsed_data['date'] and any(char.isdigit() for char in line):
                # Add date parsing logic here
                pass

            # Try to identify items and prices
            if '$' in line:
                # Add item parsing logic here
                pass

            # Try to identify total
            if 'TOTAL' in line.upper():
                try:
                    parsed_data['total'] = float(line.split('$')[-1].strip())
                except:
                    pass

        return parsed_data

    @staticmethod
    async def process_grocery_receipt(file_path: str) -> Dict[str, Any]:
        """
        Process a grocery receipt and extract item codes and details.
        """
        try:
            # First process the receipt normally
            receipt_data = await OCRService.process_receipt(file_path)
            
            # Add grocery-specific processing
            if receipt_data.get('merchant_name'):
                # Add grocery store specific parsing logic here
                # This would include looking for item codes, quantities, and prices
                pass

            return receipt_data

        except Exception as e:
            raise Exception(f"Error processing grocery receipt: {str(e)}") 