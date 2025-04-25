import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";

const speak = (text: string, lang = "en-US") => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
};

export default function FlashcardApp() {
  const [cards, setCards] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      setCards(json as any[]);
    };
    reader.readAsArrayBuffer(file);
  };

  const nextCard = () => {
    setCurrent((prev) => (prev + 1) % cards.length);
    setShowBack(false);
    setAnswer("");
    setFeedback("");
  };

  const checkAnswer = () => {
    if (!cards.length) return;
    const correct = cards[current].Chinese.trim();
    if (answer.trim() === correct) {
      setFeedback("✅ Correct!");
    } else {
      setFeedback(`❌ Wrong. Correct: ${correct}`);
    }
  };

  const currentCard = cards[current];

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">English Flashcards</h1>

      <Input type="file" accept=".xlsx" onChange={loadExcel} className="mb-4" />

      {cards.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-6 text-center">
            {!quizMode ? (
              <div>
                <div className="text-xl font-semibold">
                  {currentCard.English} [{currentCard.KK}]
                </div>
                <Button className="m-2" onClick={() => speak(currentCard.English)}>
                  🔊 英文發音
                </Button>

                {showBack ? (
                  <div className="mt-4">
                    <div className="text-lg">{currentCard.Chinese}</div>
                    <Button className="m-2" onClick={() => speak(currentCard.Chinese, "zh-TW")}>🔊 中文朗讀</Button>
                  </div>
                ) : (
                  <Button className="mt-4" onClick={() => setShowBack(true)}>
                    顯示解答
                  </Button>
                )}
              </div>
            ) : (
              <div>
                <div className="text-xl font-semibold">
                  {currentCard.English} [{currentCard.KK}]
                </div>
                <Input
                  className="mt-4"
                  placeholder="輸入中文意思"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <Button className="mt-2" onClick={checkAnswer}>檢查答案</Button>
                {feedback && <div className="mt-2">{feedback}</div>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {cards.length > 0 && (
        <div className="flex justify-between">
          <Button onClick={() => setQuizMode(!quizMode)}>
            {quizMode ? "切換成卡片模式" : "切換成測驗模式"}
          </Button>
          <Button onClick={nextCard}>下一題</Button>
        </div>
      )}
    </div>
  );
}
