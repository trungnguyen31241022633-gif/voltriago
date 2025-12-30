# Prompt Template cho OpenAI API - Phân tích CV

## 1. System Prompt (System Message)

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
Trả về JSON hợp lệ khớp với Schema bên dưới. Văn phong chuyên nghiệp, khích lệ.
```

## 2. User Prompt (Với Image)

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
  "suggestedJobs": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "suggestedProjects": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "suggestedCollaborators": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "developmentRoadmap": {
    "courses": [
      {
        "name": "string",
        "provider": "string",
        "description": "string"
      }
    ],
    "projects": [
      {
        "name": "string",
        "durationOrType": "string",
        "description": "string"
      }
    ],
    "jobs": [
      {
        "name": "string",
        "provider": "string",
        "description": "string"
      }
    ]
  }
}
```

## 3. Mẫu Code Gọi API (JavaScript/TypeScript)

```typescript
import { AnalysisResult } from "../types";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const analyzeCV = async (
  base64Data: string,
  mimeType: string,
  targetJob: string
): Promise<AnalysisResult> => {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API Key chưa được cấu hình!");
  }

  const systemPrompt = `Bạn là Voltria, một Chuyên gia Tuyển dụng AI cao cấp. Mục tiêu của bạn là phân tích sâu CV và đưa ra phản hồi có cấu trúc.

**QUAN TRỌNG:** TẤT CẢ NỘI DUNG TRẢ LỜI PHẢI BẰNG TIẾNG VIỆT.

**Quy tắc phân tích:**
1. **Tóm tắt & Đánh giá:** Phân tích Kinh nghiệm, Kỹ năng, Ổn định, Khoảng trống...
2. **Lộ trình phát triển (Roadmap):** Bạn PHẢI đề xuất một lộ trình 3 giai đoạn rõ ràng:
   - **Giai đoạn 1: Nâng cao kiến thức.** Đề xuất các khóa học cụ thể (tên khóa, nền tảng như Coursera/Udemy/EdX) hoặc chứng chỉ (AWS, IELTS, PMP...)
   - **Giai đoạn 2: Thực hành & Xây dựng Portfolio.** Đề xuất các dự án cá nhân, tham gia Open Source, hoặc ý tưởng Start-up nhỏ
   - **Giai đoạn 3: Cơ hội nghề nghiệp.** Đề xuất các vị trí tại các loại hình công ty cụ thể

**Yêu cầu đầu ra:**
Trả về JSON hợp lệ. Văn phong chuyên nghiệp, khích lệ.`;

  const userPrompt = `Vị trí công việc mục tiêu: ${targetJob || "Đánh giá tổng quát"}

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
}`;

  // Xác định image URL format
  const imageUrl = `data:${mimeType};base64,${base64Data}`;

  const requestBody = {
    model: "gpt-4o", // hoặc "gpt-4-vision-preview" nếu dùng model cũ
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          }
        ]
      }
    ],
    response_format: { type: "json_object" }, // Quan trọng: yêu cầu JSON response
    temperature: 0.7,
    max_tokens: 4000
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Không nhận được phản hồi từ OpenAI");
    }

    // Parse JSON response
    const analysisResult = JSON.parse(content) as AnalysisResult;

    // Validate required fields
    if (!analysisResult.candidateLevel || !analysisResult.summary || typeof analysisResult.matchScore !== 'number') {
      throw new Error("Response không đúng format");
    }

    return analysisResult;
  } catch (error) {
    console.error("Lỗi phân tích OpenAI:", error);
    throw error;
  }
};
```

## 4. Cấu hình Environment Variables

Tạo file `.env.local`:
```
VITE_OPENAI_API_KEY=sk-proj-your-api-key-here
```

## 5. Lưu ý quan trọng

1. **Model**: Sử dụng `gpt-4o` hoặc `gpt-4-vision-preview` để hỗ trợ vision
2. **response_format**: Phải set `{ type: "json_object" }` để đảm bảo response là JSON
3. **Image Format**: Sử dụng `data:image/png;base64,{base64Data}` hoặc `data:application/pdf;base64,{base64Data}`
4. **PDF**: Nếu là PDF, có thể cần convert sang image trước hoặc sử dụng model hỗ trợ PDF
5. **Token Limit**: `max_tokens: 4000` để đảm bảo đủ cho response dài

## 6. Test với cURL

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "system",
        "content": "Bạn là Voltria, một Chuyên gia Tuyển dụng AI..."
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "Phân tích CV này cho tôi..."
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

