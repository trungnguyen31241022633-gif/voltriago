/// <reference types="vite/client" />
import { AnalysisResult } from "../types";

// Lấy API key từ environment variables
const getApiKey = (): string => {
  const key = (import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY) as string | undefined;
  
  if (!key) {
    throw new Error(
      "❌ OpenAI API Key chưa được cấu hình!\n\n" +
      "Trên Vercel (chọn 1 trong 2):\n" +
      "• VITE_OPENAI_API_KEY = your_api_key (khuyên dùng)\n" +
      "• OPENAI_API_KEY = your_api_key\n\n" +
      "Local development - Tạo file .env.local:\n" +
      "VITE_OPENAI_API_KEY=your_api_key\n\n" +
      "Lấy API key tại: https://platform.openai.com/api-keys"
    );
  }
  
  return key;
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const SYSTEM_PROMPT = `Bạn là Voltria, một Chuyên gia Tuyển dụng AI cao cấp. Mục tiêu của bạn là phân tích sâu CV và đưa ra phản hồi có cấu trúc.

**QUAN TRỌNG:** TẤT CẢ NỘI DUNG TRẢ LỜI PHẢI BẰNG TIẾNG VIỆT.

**Quy tắc phân tích:**
1. **Tóm tắt & Đánh giá:** Phân tích Kinh nghiệm, Kỹ năng, Ổn định, Khoảng trống...
2. **Lộ trình phát triển (Roadmap):** Bạn PHẢI đề xuất một lộ trình 3 giai đoạn rõ ràng:
   - **Giai đoạn 1: Nâng cao kiến thức.** Đề xuất các khóa học cụ thể (tên khóa, nền tảng như Coursera/Udemy/EdX) hoặc chứng chỉ (AWS, IELTS, PMP...)
   - **Giai đoạn 2: Thực hành & Xây dựng Portfolio.** Đề xuất các dự án cá nhân, tham gia Open Source, hoặc ý tưởng Start-up nhỏ
   - **Giai đoạn 3: Cơ hội nghề nghiệp.** Đề xuất các vị trí tại các loại hình công ty cụ thể (ví dụ: "Tập đoàn công nghệ Viettel - Vị trí Junior Dev", "Startup Fintech tại TP.HCM - Vị trí BA")

**Yêu cầu đầu ra:**
Trả về JSON hợp lệ. Văn phong chuyên nghiệp, khích lệ.`;

const createUserPrompt = (targetJob: string): string => {
  return `Vị trí công việc mục tiêu: ${targetJob || "Đánh giá tổng quát"}

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
};

/**
 * Phân tích CV sử dụng OpenAI API
 * @param base64Data - Dữ liệu CV dạng base64
 * @param mimeType - Loại file (image/png, image/jpeg, application/pdf)
 * @param targetJob - Vị trí công việc mục tiêu (tùy chọn)
 * @returns Promise<AnalysisResult> - Kết quả phân tích CV
 */
export const analyzeCV = async (
  base64Data: string,
  mimeType: string,
  targetJob: string
): Promise<AnalysisResult> => {
  try {
    const apiKey = getApiKey();
    
    // Xác định image URL format
    const imageUrl = `data:${mimeType};base64,${base64Data}`;

    // Tạo prompt với system instruction và user prompt
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${createUserPrompt(targetJob)}`;

    const requestBody = {
      model: "gpt-5-nano",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: fullPrompt
            },
            {
              type: "input_image",
              image_url: imageUrl
            }
          ]
        }
      ],
      store: true
    };

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API Error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    // Kiểm tra status
    if (data.status !== "completed") {
      throw new Error(`API chưa hoàn thành: ${data.status}`);
    }

    // Tìm message output trong response
    const messageOutput = data.output?.find(
      (item: any) => item.type === "message" && item.status === "completed"
    );

    if (!messageOutput) {
      throw new Error("Không tìm thấy message output trong response");
    }

    // Lấy text từ content
    const textContent = messageOutput.content?.find(
      (item: any) => item.type === "output_text"
    );

    if (!textContent?.text) {
      throw new Error("Không nhận được phản hồi từ OpenAI");
    }

    // Parse JSON response - có thể có markdown code blocks
    let jsonText = textContent.text.trim();
    
    // Loại bỏ markdown code blocks nếu có
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const analysisResult = JSON.parse(jsonText) as AnalysisResult;

    // Validate required fields
    if (
      !analysisResult.candidateLevel ||
      !analysisResult.summary ||
      typeof analysisResult.matchScore !== "number" ||
      !Array.isArray(analysisResult.strengths) ||
      !Array.isArray(analysisResult.weaknesses) ||
      !analysisResult.detailedAnalysis ||
      !analysisResult.developmentRoadmap
    ) {
      throw new Error("Response không đúng format - thiếu các trường bắt buộc");
    }

    // Validate detailedAnalysis
    const requiredDetailedFields = [
      "experienceMatch",
      "skillsAssessment",
      "jobStability",
      "employmentGaps",
      "progressionAndAwards",
      "teamworkAndSoftSkills",
      "proactivity"
    ];

    for (const field of requiredDetailedFields) {
      if (!analysisResult.detailedAnalysis[field as keyof typeof analysisResult.detailedAnalysis]) {
        throw new Error(`Response thiếu trường: detailedAnalysis.${field}`);
      }
    }

    // Validate developmentRoadmap
    if (
      !Array.isArray(analysisResult.developmentRoadmap.courses) ||
      !Array.isArray(analysisResult.developmentRoadmap.projects) ||
      !Array.isArray(analysisResult.developmentRoadmap.jobs)
    ) {
      throw new Error("Response thiếu developmentRoadmap arrays");
    }

    return analysisResult;
  } catch (error) {
    console.error("Lỗi phân tích OpenAI:", error);
    
    // Cải thiện error message
    if (error instanceof SyntaxError) {
      throw new Error("Không thể parse JSON từ response. API có thể trả về format không đúng.");
    }
    
    throw error;
  }
};

