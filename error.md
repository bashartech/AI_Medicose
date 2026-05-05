INFO:     Uvicorn running on http://0.0.0.0:7860 (Press CTRL+C to quit)
2026-04-16 11:40:05,940 - app.services.file_service - ERROR - Error uploading file: 'bool' object has no attribute 'encode'
2026-04-16 11:40:14,452 - app.services.report_text_cleaner - INFO - AI Response: ```json
{
  "patient_info": {
    "name": "MrDummy Patient",
    "age_gender": "20/Male"
  },
  "sections": [
    {
      "name": "HAEMATOLOGY",
      "tests": [
        {
          "name": "Haemoglobin",
          "value": "15",
          "ref_range": "13-17",
          "unit": "g/dL",
          "status": "normal"
        },
        {
          "name": "Total Leucocyte Count",
          "value": "5000",
          "ref_range": "4000 - 10000",
          "unit": "cells/mm³",
          "status": "n...
2026-04-16 11:40:14,452 - app.services.report_text_cleaner - INFO - AI parsed 1 sections
2026-04-16 11:40:14,491 - app.services.database_service - ERROR - Error saving report analysis: [Errno -2] Name or service not known
2026-04-16 11:40:14,492 - app.routes.reports_router - WARNING - Database save failed, using generated UUID: 4a1a1652-89c9-409b-a2fd-4a6503039ced
INFO:     10.16.33.124:32008 - "POST /api/v1/reports/upload HTTP/1.1" 200 OK
2026-04-16 11:40:14,786 - app.services.database_service - ERROR - Error getting report: [Errno -2] Name or service not known
INFO:     10.16.22.250:42477 - "GET /api/v1/reports/4a1a1652-89c9-409b-a2fd-4a6503039ced HTTP/1.1" 404 Not Found
2026-04-16 11:41:48,117 - app.services.file_service - ERROR - Error uploading file: 'bool' object has no attribute 'encode'
2026-04-16 11:41:53,818 - app.services.database_service - ERROR - Error saving image analysis: [Errno -2] Name or service not known
INFO:     10.16.12.178:58925 - "POST /api/v1/images/upload HTTP/1.1" 200 OK
2026-04-16 11:41:53,818 - app.routes.images_router - WARNING - Database save failed, using generated UUID: b34f0687-2797-4f09-a658-afbd57e15d91
2026-04-16 11:41:54,263 - app.services.database_service - ERROR - Error getting image: [Errno -2] Name or service not known
INFO:     10.16.12.178:58925 - "GET /api/v1/images/b34f0687-2797-4f09-a658-afbd57e15d91 HTTP/1.1" 404 Not Found
 