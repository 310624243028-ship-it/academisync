
import { GoogleGenAI, Type } from "@google/genai";
import { Topic, Question } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const parseSyllabus = async (subjectName: string, syllabusContent?: string): Promise<Topic[]> => {
  const ai = getAI();
  
  const prompt = syllabusContent 
    ? `Analyze the following official syllabus content for the subject "${subjectName}" and extract a structured list of main topics and their subtopics. 
       CONTENT:
       ${syllabusContent}`
    : `Analyze the subject "${subjectName}" and provide a structured syllabus with main topics and their subtopics based on common academic standards.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            subtopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING }
                },
                required: ["id", "name"]
              }
            }
          },
          required: ["id", "name", "subtopics"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Failed to parse syllabus JSON:", error);
    return [];
  }
};

export const mapQuestionsToTopics = async (
  paperText: string,
  syllabus: Topic[]
): Promise<Partial<Question>[]> => {
  const ai = getAI();
  const syllabusContext = JSON.stringify(syllabus);
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Given the following question paper text and syllabus structure, identify the questions and map each to the most relevant topic and subtopic from the syllabus.
    
    PAPER TEXT:
    ${paperText}
    
    SYLLABUS:
    ${syllabusContext}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            allottedMarks: { type: Type.NUMBER },
            mappedTopicId: { type: Type.STRING },
            mappedSubtopicId: { type: Type.STRING }
          },
          required: ["text", "allottedMarks", "mappedTopicId"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Failed to map questions JSON:", error);
    return [];
  }
};

export const generateInsights = async (
  performanceData: any,
  subjectName: string
): Promise<any[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as an academic counselor. Based on this student's performance in "${subjectName}", provide study recommendations for each topic.
    Performance Data: ${JSON.stringify(performanceData)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topicId: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            priority: { type: Type.STRING, description: "High, Medium, or Low" }
          },
          required: ["topicId", "suggestion", "priority"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};
