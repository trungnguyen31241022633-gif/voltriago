# Hướng Dẫn Prompt cho OpenAI API - Phân tích CV

## 📋 Tổng Quan

File này chứa prompt mẫu để gọi OpenAI API và đảm bảo response trả về đúng format `AnalysisResult` như trong code hiện tại.

## 🔑 System Prompt (Bắt buộc)

```
Bạn là Voltria, một Chuyên gia Tuyển dụng AI cao cấp. Mục tiêu của bạn là phân tích sâu CV và đưa ra phản hồi có cấu trúc.

**QUAN TRỌNG:** TẤT CẢ NỘI DUNG TRẢ LỜI PHẢI BẰNG TIẾNG VIỆT.

**Quy tắc phân tích:**
1. **Tóm tắt & Đánh giá:** Phân tích Kinh nghiệm, Kỹ năng, Ổn định, Khoảng trống...
2. **Lộ trình phát triển (Roadmap):** Bạn PHẢI đề xuất một lộ trình 3 giai đoạn rõ ràng:
   - **Giai đoạn 1: Nâng cao kiến thức.** Đề xuất các khóa học cụ thể (tên khóa, nền tảng như Coursera/Udemy/EdX) hoặc chứng chỉ (AWS, IELTS, PMP...)
   - **Giai đoạn 2: Thực hành & Xây dựng Portfolio.** Đề xuất các dự án cá nhân, tham gia Open Source, hoặc ý tưởng Start-up nhỏ
   - **Giai đoạn 3: Cơ hội nghề nghiệp.** Đề xuất các vị trí tại các loại hình công ty cụ thể (ví dụ: "Tập đoàn công nghệ Viettel - Vị trí Junior Dev", "Startup Fintech tại TP.HCM - Vị trí BA")

**Yêu cầu đầu ra:**
Trả về JSON hợp lệ. Văn phong chuyên nghiệp, khích lệ.
```

## 📝 User Prompt Template

```
Vị trí công việc mục tiêu: {targetJob || "Đánh giá tổng quát"}

Hãy phân tích CV đính kèm và tạo lộ trình phát triển. Trả lời hoàn toàn bằng Tiếng Việt.

**YÊU CẦU QUAN TRỌNG:**
- Trả về ĐÚNG định dạng JSON theo schema bên dưới
- Tất cả các trường đều bắt buộc
- candidateLevel: "Junior" | "Middle" | "Senior" | "Expert"
- matchScore: số nguyên từ 0-100
- strengths: mảng ít nhất 3-5 chuỗi
- weaknesses: mảng ít nhất 3-5 chuỗi
- detailedAnalysis: object với 7 trường bắt buộc
- suggestedJobs: mảng ít nhất 2 items
- suggestedProjects: mảng ít nhất 2 items
- suggestedCollaborators: mảng ít nhất 1 item
- developmentRoadmap: object với 3 mảng (courses, projects, jobs), mỗi mảng ít nhất 2-3 items

**JSON Schema:**
{
  "candidateLevel": "string",
  "summary": "string",
  "matchScore": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "detailedAnalysis": {
    "experienceMatch": "string",
    "skillsAssessment": "string",
    "jobStability": "string",
    "employmentGaps": "string",
    "progressionAndAwards": "string",
    "teamworkAndSoftSkills": "string",
    "proactivity": "string"
  },
  "suggestedJobs": [{"title": "string", "description": "string"}],
  "suggestedProjects": [{"title": "string", "description": "string"}],
  "suggestedCollaborators": [{"title": "string", "description": "string"}],
  "developmentRoadmap": {
    "courses": [{"name": "string", "provider": "string", "description": "string"}],
    "projects": [{"name": "string", "durationOrType": "string", "description": "string"}],
    "jobs": [{"name": "string", "provider": "string", "description": "string"}]
  }
}
```

## 🔧 Cấu Hình API Request

### Endpoint
```
POST https://api.openai.com/v1/chat/completions
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
```

### Request Body
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "{SYSTEM_PROMPT}"
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "{USER_PROMPT}"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:{mimeType};base64,{base64Data}"
          }
        }
      ]
    }
  ],
  "response_format": { "type": "json_object" },
  "temperature": 0.7,
  "max_tokens": 4000
}
```

## ⚠️ Lưu Ý Quan Trọng

1. **response_format**: **BẮT BUỘC** phải set `{ "type": "json_object" }` để đảm bảo response là JSON hợp lệ
2. **Model**: Sử dụng `gpt-4o` hoặc `gpt-4-vision-preview` để hỗ trợ vision (phân tích hình ảnh)
3. **Image Format**: 
   - PNG/JPG: `data:image/png;base64,{base64Data}`
   - PDF: `data:application/pdf;base64,{base64Data}` (có thể cần model hỗ trợ PDF)
4. **Token Limit**: `max_tokens: 4000` để đảm bảo đủ cho response dài
5. **Temperature**: `0.7` để cân bằng giữa sáng tạo và chính xác

## 📊 Response Format

Response sẽ có dạng:
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{JSON_STRING_THEO_SCHEMA}"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "tokens": 1234
  }
}
```

Bạn cần parse `content` từ `choices[0].message.content` để lấy JSON object.

## 🧪 Test với cURL

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "Bạn là Voltria, một Chuyên gia Tuyển dụng AI cao cấp..."
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "Vị trí công việc mục tiêu: Senior Frontend Developer\n\nHãy phân tích CV đính kèm..."
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/png;base64,iVBORw0KGgo..."
            }
          }
        ]
      }
    ],
    "response_format": { "type": "json_object" },
    "temperature": 0.7,
    "max_tokens": 4000
  }'
```

## 📁 Files Liên Quan

- `services/openaiService.ts` - Implementation đầy đủ
- `types.ts` - Schema định nghĩa `AnalysisResult`
- `PROMPT_TEMPLATE.md` - Template chi tiết hơn

## ✅ Checklist Đảm Bảo Response Đúng Format

- [ ] System prompt có yêu cầu trả về JSON
- [ ] User prompt có JSON schema chi tiết
- [ ] Request có `response_format: { type: "json_object" }`
- [ ] Model hỗ trợ vision (gpt-4o hoặc gpt-4-vision-preview)
- [ ] Image URL format đúng: `data:{mimeType};base64,{base64Data}`
- [ ] Parse JSON từ `choices[0].message.content`
- [ ] Validate các trường bắt buộc sau khi parse

