# Financial Conversation Flow Enhancements

## Overview
This update enhances the conversation flow with finance-specific terminology and improves the UI handling of conversation cards.

## UI Improvements
1. Fixed card overflow in conversation buttons
   - Added scrollable container with max-height and overflow handling
   - Added proper button spacing with margin-bottom
   - Ensured buttons have full width access

2. Improved message alignment and consistency
   - Updated message container to use flex-col and full width
   - Made avatar containers use flex-shrink-0 to prevent distortion
   - Standardized message widths to 75% for better presentation
   - Ensured loading indicator matches regular message styling

## Content/Terminology Improvements
1. Enhanced financial data extraction question
   - Updated prompt to "Which type of financial data extraction do you need from this document?"
   - Changed options to use finance-specific terminology:
     - "Financial Tables & Metrics"
     - "Document Summarization"
     - "Comprehensive Financial Extraction"
     - "Skip Financial Data Extraction"

2. Enhanced pattern matching for financial terminology
   - Added financial-specific terms to each extraction type
   - Implemented case-insensitive pattern matching
   - Added specialized detection for financial + extraction type combinations
   - Added detailed logging for troubleshooting