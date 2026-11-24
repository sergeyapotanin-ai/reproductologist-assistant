"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, Settings } from "lucide-react";

interface VoiceDictationProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function VoiceDictation({
  value,
  onChange,
  placeholder = "Начните говорить или введите текст...",
  className = "",
}: VoiceDictationProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interim, setInterim] = useState("");
  const [useWhisper, setUseWhisper] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition || !!navigator.mediaDevices);

      const savedKey = localStorage.getItem("openai_api_key") || "";
      setApiKey(savedKey);
      setUseWhisper(
        !!savedKey && localStorage.getItem("use_whisper") === "true"
      );

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "ru-RU";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            onChange((value + " " + finalTranscript).trim());
          }
          setInterim(interimTranscript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => {
          setIsListening(false);
          setInterim("");
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.stop();
    };
  }, [value, onChange]);

  const saveSettings = () => {
    localStorage.setItem("openai_api_key", apiKey);
    localStorage.setItem("use_whisper", useWhisper ? "true" : "false");
    setShowSettings(false);
  };

  const startWhisperRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());

        try {
          const formData = new FormData();
          formData.append("file", blob, "audio.webm");
          formData.append("model", "whisper-1");
          formData.append("language", "ru");

          const res = await fetch(
            "https://api.openai.com/v1/audio/transcriptions",
            {
              method: "POST",
              headers: { Authorization: `Bearer ${apiKey}` },
              body: formData,
            }
          );

          if (!res.ok) throw new Error("Whisper API error");
          const data = await res.json();
          if (data.text) {
            onChange((value + " " + data.text).trim());
          }
        } catch (err) {
          console.error(err);
          alert(
            "Ошибка Whisper. Проверьте API-ключ или используйте обычный режим."
          );
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
    } catch {
      alert("Не удалось получить доступ к микрофону");
    }
  };

  const stopWhisperRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (useWhisper && apiKey) {
      if (isListening) stopWhisperRecording();
      else startWhisperRecording();
      return;
    }

    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        value={value + (interim ? " " + interim : "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[120px] p-3 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y"
      />

      <div className="absolute top-3 right-3 flex gap-1">
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          title="Настройки распознавания"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleListening}
          disabled={!isSupported || isProcessing}
          className={`p-2 rounded-full transition-colors ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
          }`}
          title={useWhisper ? "Whisper (OpenAI)" : "Web Speech API"}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      </div>

      {isListening && (
        <div className="absolute bottom-2 left-3 text-xs text-red-500 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          {useWhisper ? "Запись для Whisper..." : "Идёт запись..."}
        </div>
      )}

      {showSettings && (
        <div className="absolute z-20 top-14 right-0 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg p-4 space-y-3">
          <p className="text-sm font-medium">Настройки голоса</p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useWhisper}
              onChange={(e) => setUseWhisper(e.target.checked)}
            />
            Использовать Whisper (OpenAI)
          </label>
          {useWhisper && (
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="OpenAI API Key (sk-...)"
              className="w-full px-2 py-1.5 text-sm rounded border dark:bg-gray-900"
            />
          )}
          <p className="text-xs text-gray-500">
            Whisper точнее распознаёт медицинские термины. Ключ хранится только
            в браузере.
          </p>
          <button
            onClick={saveSettings}
            className="w-full py-2 bg-teal-600 text-white text-sm rounded-lg"
          >
            Сохранить
          </button>
        </div>
      )}
    </div>
  );
}
