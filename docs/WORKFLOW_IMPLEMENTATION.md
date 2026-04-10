# 🏥 AI Doctor Platform - Two Workflow Implementation Plan

## Overview

This document defines **TWO distinct workflows** for medical analysis in the AI Doctor Platform:

1. **Workflow 1: Dedicated Upload & Analysis** - Specialist-first approach (structured results)
2. **Workflow 2: Chat-Integrated Analysis** - Conversation-first approach (natural dialogue)

Both workflows must coexist to serve different user needs.

---

## 📊 Workflow Comparison

| Aspect | Workflow 1: Dedicated Upload | Workflow 2: Chat-Integrated |
|--------|------------------------------|------------------------------|
| **Entry Point** | `/upload-image` or `/upload-report` pages | `/chat` page |
| **User Intent** | "I want to analyze this specific test/image" | "I want to consult with a doctor about this" |
| **File Upload** | Before conversation starts | During conversation |
| **Analysis Type** | Structured ML/OCR + AI explanation | AI analyzes in conversational context |
| **Results Display** | Dedicated UI sections (tables, highlights) | Natural language in chat messages |
| **Follow-up** | View, download PDF, start new analysis | Ask follow-up questions naturally |
| **History** | Saved as analysis record | Saved as chat conversation |
| **Best For** | Quick analysis, official records | Ongoing consultations, advice |

---

## 🔄 Workflow 1: Dedicated Upload & Analysis

### User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User visits /upload-image or /upload-report                 │
│    - Selects specialist (Cardiologist, Dermatologist, etc.)    │
│    - Selects type (X-Ray, Skin Image, Blood Report, etc.)      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. User uploads file or captures from webcam                    │
│    - Drag & drop or click to browse                             │
│    - Webcam capture for skin/oral/posture images                │
│    - File validation (type, size)                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Backend Processing                                           │
│    - Upload to Supabase Storage                                 │
│    - Run ML analysis (images) or OCR (reports)                  │
│    - Save results to database                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Results Display                                              │
│    - Image with ML highlights (bounding boxes, heatmaps)        │
│    - Extracted lab values in table format                       │
│    - AI specialist explanation                                  │
│    - Recommendations list                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Actions                                                      │
│    - Save to history                                            │
│    - Download PDF report                                        │
│    - Start chat with specialist about results                   │
│    - Upload another file                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Pages & Components

**New Pages to Create:**
```
src/pages/
├── UploadImage.tsx          # NEW: Image upload page
├── UploadReport.tsx         # NEW: Report upload page
└── AnalysisResults.tsx      # NEW: Results display page
```

**New Components:**
```
src/components/
├── upload/
│   ├── FileUploader.tsx     # Drag-drop file upload
│   ├── WebcamCapture.tsx    # Webcam capture modal
│   ├── ImageTypeSelector.tsx # Select image type (xray, skin, etc.)
│   └── SpecialistSelector.tsx # Select specialist
├── analysis/
│   ├── ImageAnalysis.tsx    # Display image analysis results
│   ├── ReportAnalysis.tsx   # Display report analysis results
│   ├── LabValuesTable.tsx   # Table for extracted lab values
│   ├── ImageHighlights.tsx  # ML detection overlays on images
│   └── FindingsList.tsx     # List of detected findings
└── results/
    ├── ResultsSummary.tsx   # Summary card
    ├── DownloadPDFButton.tsx # PDF download
    └── SaveToHistoryButton.tsx # Save action
```

### API Endpoints

**Image Upload & Analysis:**
```
POST   /api/v1/images/upload
  - Upload image file
  - Returns: image_id, image_url, ml_results

POST   /api/v1/images/analyze/{image_id}
  - Send ML results to AI agent for explanation
  - Returns: ai_explanation, recommendations

GET    /api/v1/images/{image_id}
  - Get image details and analysis
  - Returns: full image record with all data

DELETE /api/v1/images/{image_id}
  - Delete image and analysis
```

**Report Upload & Analysis:**
```
POST   /api/v1/reports/upload
  - Upload PDF/image report
  - Returns: report_id, ocr_text, structured_data

POST   /api/v1/reports/analyze/{report_id}
  - Send OCR text to AI agent for explanation
  - Returns: ai_analysis, diagnosis_summary, recommendations

GET    /api/v1/reports/{report_id}
  - Get report details
  - Returns: full report record

DELETE /api/v1/reports/{report_id}
  - Delete report
```

### Backend Processing Flow

```python
# POST /api/v1/images/upload
@router.post("/upload")
async def upload_image(
    file: UploadFile,
    image_type: str,  # xray, skin, oral, posture
    specialist_type: str,  # cardiologist-specialist, etc.
    user_id: str
):
    # 1. Validate file
    if not file.content_type.startswith('image/'):
        raise HTTPException(400, "Must be an image file")
    
    # 2. Read file bytes
    file_bytes = await file.read()
    
    # 3. Upload to Supabase Storage
    file_service = FileService()
    upload_result = await file_service.upload_file(
        file_bytes=file_bytes,
        file_name=file.filename,
        bucket="medical-images",
        user_id=user_id,
        file_type=file.content_type
    )
    
    # 4. Run ML analysis based on image_type
    image_service = ImageAnalysisService()
    ml_results = None
    
    if image_type == "xray":
        ml_results = await image_service.analyze_xray(file_bytes)
    elif image_type == "skin":
        ml_results = await image_service.analyze_skin_lesion(file_bytes)
    elif image_type == "oral":
        ml_results = await image_service.analyze_oral_health(file_bytes)
    elif image_type == "posture":
        ml_results = await image_service.analyze_posture(file_bytes)
    
    # 5. Save to database
    # db.images.insert({...})
    
    # 6. Return results
    return {
        "image_id": "xxx",
        "image_url": upload_result["public_url"],
        "ml_results": ml_results,
        "specialist_type": specialist_type,
        "status": "completed"
    }
```

### UI State Flow

```typescript
// UploadImage.tsx state
const [selectedSpecialist, setSelectedSpecialist] = useState('');
const [selectedImageType, setSelectedImageType] = useState('');
const [uploadedFile, setUploadedFile] = useState<File | null>(null);
const [isUploading, setIsUploading] = useState(false);
const [analysisResults, setAnalysisResults] = useState(null);
const [showWebcam, setShowWebcam] = useState(false);

// Upload handler
const handleUpload = async () => {
  setIsUploading(true);
  
  // Upload image
  const result = await api.images.upload(
    uploadedFile,
    selectedImageType,
    selectedSpecialist,
    userId
  );
  
  // Get AI explanation
  const analysis = await api.images.analyze(result.image_id, {
    specialist_type: selectedSpecialist
  });
  
  setAnalysisResults({
    ...result,
    ai_explanation: analysis.ai_explanation,
    recommendations: analysis.recommendations
  });
  
  setIsUploading(false);
};
```

---

## 💬 Workflow 2: Chat-Integrated Analysis

### User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User opens /chat?agent=dermatologist-specialist             │
│    - Chat interface loads with specialist selected              │
│    - Welcome message from AI specialist                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. User starts conversation                                     │
│    - Types symptoms or question                                 │
│    - AI responds with expert advice                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. User uploads file IN CHAT                                    │
│    - Clicks attachment button (📎) in chat input                │
│    - Selects image or PDF                                       │
│    - File uploads with optional message                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend Processing                                           │
│    - Upload file to Supabase Storage                            │
│    - Run ML analysis (images) or OCR (reports)                  │
│    - AI agent analyzes results IN CONTEXT of conversation       │
│    - Generates natural language response                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. AI Responds in Chat                                          │
│    - Shows uploaded file preview in chat                        │
│    - Displays analysis in conversational tone                   │
│    - Provides recommendations, advice, next steps               │
│    - Can answer follow-up questions about the file              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Continue Conversation                                        │
│    - User asks follow-up questions                              │
│    - AI remembers previous analysis in context                  │
│    - Natural medical consultation flow                          │
└─────────────────────────────────────────────────────────────────┘
```

### Enhanced Chat Components

**Update Existing Components:**
```
src/pages/Chat.tsx             # ENHANCED: Add file upload support
src/components/ChatInput.tsx   # ENHANCED: Add attachment button
src/components/ChatMessage.tsx # ENHANCED: Show file previews
```

**New Components:**
```
src/components/chat/
├── ChatFileAttachment.tsx     # File preview in chat message
├── ChatUploadButton.tsx       # Attachment button in input
└── FileUploadProgress.tsx     # Upload progress indicator
```

### Chat Message with File

```typescript
interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  // NEW: File attachment support
  attachment?: {
    type: "image" | "pdf";
    url: string;
    file_name: string;
    analysis?: {
      ml_results?: any;
      ocr_text?: string;
      ai_summary: string;
    };
  };
}
```

### Enhanced Chat Input

```typescript
// ChatInput.tsx - Enhanced with file upload
interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isLoading: boolean;
  agentId: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  agentId
}) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSend = () => {
    if (message.trim() || selectedFile) {
      onSendMessage(message, selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950 px-6 py-4">
      {/* File preview */}
      {selectedFile && (
        <div className="mb-3 flex items-center gap-3 bg-slate-800 rounded-lg p-3">
          <FileText className="w-8 h-8 text-cyan-400" />
          <div className="flex-1">
            <p className="text-white font-medium">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedFile(null)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <div className="flex gap-3">
          {/* Attachment button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-cyan-400"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,application/pdf"
          />

          {/* Message input */}
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white"
            placeholder={isLoading ? "Specialist is analyzing..." : "Type your health question..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          />

          {/* Send button */}
          <Button type="submit" disabled={isLoading}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
```

### API Endpoints

**Chat with File Upload:**
```
POST   /api/v1/chat/analyze
  - Upload file + send message to agent
  - Agent analyzes file in context
  - Returns: natural language response

POST   /api/v1/chat/
  - Regular text chat (existing)
  - Returns: agent response
```

### Backend Processing Flow

```python
# POST /api/v1/chat/analyze
@router.post("/analyze", response_model=ChatResponse)
async def chat_with_analysis(
    file: UploadFile = File(...),
    agent_id: str = Form(...),
    message: str = Form("Please analyze this"),
    session_id: str = Form(None)
):
    """
    Chat with file upload - AI analyzes file in conversational context
    """
    try:
        # 1. Validate and read file
        file_bytes = await file.read()
        is_image = file.content_type.startswith('image/')
        is_pdf = 'pdf' in file.content_type
        
        # 2. Upload to storage
        file_service = FileService()
        upload_result = await file_service.upload_file(
            file_bytes=file_bytes,
            file_name=file.filename,
            bucket="medical-images" if is_image else "medical-reports",
            user_id=get_user_id_from_session(session_id),
            file_type=file.content_type
        )
        
        # 3. Run analysis
        analysis_result = None
        if is_image:
            image_service = ImageAnalysisService()
            if "xray" in file.filename.lower():
                analysis_result = await image_service.analyze_xray(file_bytes)
            elif "skin" in file.filename.lower():
                analysis_result = await image_service.analyze_skin_lesion(file_bytes)
            # ... other types
        elif is_pdf:
            ocr_service = OCRService()
            analysis_result = await ocr_service.process_medical_report(file_bytes, file.content_type)
        
        # 4. Build context with analysis
        context = f"Patient uploaded a file: {file.filename}\n"
        if analysis_result:
            if is_image:
                context += f"ML Analysis Results:\n{json.dumps(analysis_result, indent=2)}\n\n"
            elif is_pdf:
                context += f"Extracted Report Data:\n{analysis_result['ocr_text']}\n\n"
        
        context += f"Patient's message: {message}"
        
        # 5. Get AI agent response IN CONTEXT
        agent = get_agent(agent_id)
        response_text = await agent.run(message, context=context)
        
        # 6. Save to database (optional)
        # await save_analysis_to_db(...)
        
        # 7. Return response with file info
        return ChatResponse(
            response=response_text,
            session_id=session_id or str(uuid.uuid4()),
            attachment={
                "type": "image" if is_image else "pdf",
                "url": upload_result["public_url"],
                "file_name": file.filename,
                "analysis": analysis_result
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Enhanced Chat Page

```typescript
// Chat.tsx - Enhanced with file upload
const handleSendMessage = async (message: string, file?: File) => {
  const newUserMessage: Message = {
    id: Date.now().toString(),
    text: message || "Please analyze this file",
    sender: "user",
    timestamp: new Date(),
    attachment: file ? {
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      url: URL.createObjectURL(file),
      file_name: file.name
    } : undefined
  };

  setMessages((prev) => [...prev, newUserMessage]);
  setIsLoading(true);

  try {
    let response;
    
    if (file) {
      // Send with file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('agent_id', agentId);
      formData.append('message', message || 'Please analyze this');
      formData.append('session_id', sessionId || '');

      response = await fetch(`${API_BASE_URL}/chat/analyze`, {
        method: 'POST',
        body: formData,
      });
    } else {
      // Regular text chat
      response = await fetch(`${API_BASE_URL}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, agent_id: agentId, session_id: sessionId }),
      });
    }

    const data = await response.json();
    
    const agentResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: data.response,
      sender: "agent",
      timestamp: new Date(),
      attachment: data.attachment // File preview in response
    };

    setMessages((prev) => [...prev, agentResponse]);
    setSessionId(data.session_id);
  } catch (error) {
    console.error("Chat error:", error);
  } finally {
    setIsLoading(false);
  }
};
```

### Chat Message with File Preview

```typescript
// ChatMessage.tsx - Enhanced
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-md px-4 py-3 rounded-lg ${isUser ? "bg-cyan-600" : "bg-slate-800"}`}>
        
        {/* File attachment preview */}
        {message.attachment && (
          <div className="mb-3">
            {message.attachment.type === 'image' ? (
              <img
                src={message.attachment.url}
                alt={message.attachment.file_name}
                className="rounded-lg max-w-full h-auto"
              />
            ) : (
              <div className="flex items-center gap-3 bg-slate-700 rounded p-3">
                <FileText className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-white text-sm">{message.attachment.file_name}</p>
                  <p className="text-gray-400 text-xs">PDF Document</p>
                </div>
              </div>
            )}
            
            {/* Analysis summary if available */}
            {message.attachment.analysis && (
              <div className="mt-2 p-3 bg-slate-900 rounded text-xs text-gray-300">
                <p className="font-semibold mb-1">Analysis:</p>
                <p>{JSON.stringify(message.attachment.analysis, null, 2)}</p>
              </div>
            )}
          </div>
        )}

        {/* Message text */}
        {message.text && (
          <p className="text-sm break-words">{message.text}</p>
        )}

        <span className="text-xs mt-2 block opacity-70">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
```

---

## 🗄️ Database Schema Updates

### Add Analysis Records Table

```sql
CREATE TABLE analysis_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'report')),
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  analysis_type TEXT NOT NULL,  -- xray, skin, oral, posture, blood_report, etc.
  specialist_type TEXT NOT NULL,
  ml_results JSONB,
  ocr_text TEXT,
  ai_analysis TEXT,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analysis_user_id ON analysis_records(user_id);
CREATE INDEX idx_analysis_session_id ON analysis_records(session_id);
CREATE INDEX idx_analysis_type ON analysis_records(analysis_type);

ALTER TABLE analysis_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON analysis_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analyses"
  ON analysis_records FOR INSERT
  WITH CHECK (true);
```

---

## 📁 Complete File Structure

```
backend/app/
├── routes/
│   ├── chat_router.py         # Workflow 2: Chat + file analysis
│   │   ├── POST /             # Regular chat
│   │   └── POST /analyze      # Chat with file upload
│   ├── images_router.py       # Workflow 1: Dedicated image upload
│   │   ├── POST /upload       # Upload + ML analysis
│   │   ├── POST /analyze/{id} # AI explanation
│   │   └── POST /capture      # Webcam capture
│   └── reports_router.py      # Workflow 1: Dedicated report upload
│       ├── POST /upload       # Upload + OCR
│       ├── POST /analyze/{id} # AI analysis
│       └── GET /{id}          # Get report details
└── services/
    ├── image_analysis_service.py
    ├── ocr_service.py
    └── file_service.py

frontend/src/
├── pages/
│   ├── Chat.tsx               # Workflow 2: Enhanced with file upload
│   ├── UploadImage.tsx        # Workflow 1: NEW
│   ├── UploadReport.tsx       # Workflow 1: NEW
│   └── AnalysisResults.tsx    # Workflow 1: NEW
├── components/
│   ├── chat/
│   │   ├── ChatFileAttachment.tsx
│   │   └── ChatUploadButton.tsx
│   ├── upload/
│   │   ├── FileUploader.tsx
│   │   ├── WebcamCapture.tsx
│   │   └── SpecialistSelector.tsx
│   └── analysis/
│       ├── ImageAnalysis.tsx
│       ├── ReportAnalysis.tsx
│       └── LabValuesTable.tsx
└── services/
    └── api.ts                 # Updated with all endpoints
```

---

## ✅ Implementation Priority

### Phase 1 (Week 1-2): Core Backend
- [ ] Set up backend structure
- [ ] Create 10 AI specialist agents
- [ ] Implement OCR service
- [ ] Implement image analysis service
- [ ] Implement file service
- [ ] Create database tables

### Phase 2 (Week 2-3): Workflow 2 - Chat-Integrated
- [ ] Enhance Chat.tsx with file upload
- [ ] Update ChatInput.tsx with attachment button
- [ ] Update ChatMessage.tsx with file preview
- [ ] Create POST /chat/analyze endpoint
- [ ] Test chat-based analysis

### Phase 3 (Week 3-4): Workflow 1 - Dedicated Upload
- [ ] Create UploadImage.tsx page
- [ ] Create UploadReport.tsx page
- [ ] Create AnalysisResults.tsx page
- [ ] Create FileUploader component
- [ ] Create WebcamCapture component
- [ ] Create image/report upload endpoints
- [ ] Create analysis display components

### Phase 4 (Week 4-5): Polish & Testing
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add PDF download
- [ ] Add history pages
- [ ] Test both workflows thoroughly
- [ ] Deploy to production

---

## 🎯 Success Criteria

**Workflow 1 (Dedicated Upload) is complete when:**
- User can upload X-ray/skin/oral/posture images
- User can upload blood/urine/lab report PDFs
- ML/OCR analysis runs automatically
- Results display in structured UI with tables/highlights
- User can download PDF report
- User can save to history

**Workflow 2 (Chat-Integrated) is complete when:**
- User can upload files directly in chat
- AI analyzes file and responds naturally
- User can ask follow-up questions about the file
- File preview shows in chat message
- Conversation saves to history
- AI remembers file context in ongoing conversation

---

## 🚀 Next Steps

1. **Read this document completely**
2. **Start with Phase 1** - Backend core setup
3. **Implement Workflow 2 first** (chat-integrated) - builds on existing chat
4. **Then implement Workflow 1** (dedicated upload) - requires more UI components
5. **Test both workflows** with real use cases
6. **Deploy and gather user feedback**
