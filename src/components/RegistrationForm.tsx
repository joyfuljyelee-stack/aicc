"use client";

import { useState, type FormEvent } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// 회사 이메일 도메인. 예: "company.com" 처럼 입력하면 해당 도메인만 허용됩니다.
// 비워두면(빈 문자열) 개인 메일(gmail, naver 등)만 막고 나머지 도메인은 허용합니다.
const COMPANY_EMAIL_DOMAIN: string = "";

const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "kakao.com",
  "nate.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
];

const TEAMS = ["프로덕트", "마케팅", "세일즈", "컨설팅", "개발", "디자인", "경영지원", "기타"];
const POSITIONS = ["사원", "대리", "과장", "차장", "부장", "임원"];
const AI_EXPERIENCES = [
  "처음이에요",
  "ChatGPT 정도 써봤어요",
  "Claude도 써봤어요",
  "Claude Code까지 써봤어요",
];
const INTERESTS = ["업무 자동화", "데이터 분석", "웹서비스 만들기", "AI 도구 전반", "기타"];

type FormValues = {
  name: string;
  email: string;
  team: string;
  position: string;
  aiExperience: string;
  interest: string;
  dietary: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  team: "",
  position: "",
  aiExperience: "",
  interest: "",
  dietary: "",
};

function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) return "이메일을 입력해주세요.";

  const basicPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicPattern.test(trimmed)) return "올바른 이메일 형식이 아닙니다.";

  const domain = trimmed.split("@")[1].toLowerCase();

  if (COMPANY_EMAIL_DOMAIN) {
    if (domain !== COMPANY_EMAIL_DOMAIN.toLowerCase()) {
      return `회사 이메일(@${COMPANY_EMAIL_DOMAIN})로 입력해주세요.`;
    }
    return undefined;
  }

  if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
    return "개인 이메일이 아닌 회사 이메일로 입력해주세요.";
  }
  return undefined;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "이름을 입력해주세요.";
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  if (!values.team) errors.team = "소속 팀/부서를 선택해주세요.";
  if (!values.position) errors.position = "직급을 선택해주세요.";
  if (!values.aiExperience) errors.aiExperience = "AI 도구 사용 경험을 선택해주세요.";
  if (!values.interest) errors.interest = "가장 배우고 싶은 것을 선택해주세요.";
  return errors;
}

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";
const labelClass = "block text-sm font-medium text-slate-700";
const errorClass = "mt-1.5 text-sm text-red-600";

function Required() {
  return (
    <span className="ml-0.5 text-red-500" aria-hidden="true">
      *
    </span>
  );
}

type SelectFieldProps = {
  id: keyof FormValues;
  label: string;
  options: string[];
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function SelectField({ id, label, options, value, error, onChange }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        <Required />
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClass} ${value ? "" : "text-slate-400"}`}
      >
        <option value="" disabled>
          선택해주세요
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="text-slate-900">
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className={errorClass}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegistrationForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = (field: keyof FormValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!isSupabaseConfigured || !supabase) {
      setSubmitError(
        "아직 Supabase 연결 정보가 입력되지 않았습니다. .env.local 파일을 확인해주세요."
      );
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("registrations").insert({
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      team: values.team,
      position: values.position,
      ai_experience: values.aiExperience,
      interest: values.interest,
      dietary: values.dietary.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      // 23505 = 이미 같은 이메일로 신청한 경우
      if (error.code === "23505") {
        setErrors({ email: "이미 신청된 이메일입니다." });
      } else {
        setSubmitError("신청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"
      >
        <p className="text-2xl font-bold text-emerald-800">신청이 완료되었습니다! 🎉</p>
        <p className="mt-2 text-lg text-emerald-700">당일 노트북 꼭 챙겨오세요.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <p className="-mt-2 text-sm text-slate-500">
        <span className="text-red-500">*</span> 표시는 필수 항목입니다.
      </p>
      <div>
        <label htmlFor="name" className={labelClass}>
          이름
          <Required />
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setField("name")(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          placeholder="홍길동"
          className={inputClass}
        />
        {errors.name && (
          <p id="name-error" className={errorClass}>
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          이메일
          <Required />
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setField("email")(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          placeholder="name@company.com"
          className={inputClass}
        />
        {errors.email && (
          <p id="email-error" className={errorClass}>
            {errors.email}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SelectField
          id="team"
          label="소속 팀/부서"
          options={TEAMS}
          value={values.team}
          error={errors.team}
          onChange={setField("team")}
        />
        <SelectField
          id="position"
          label="직급"
          options={POSITIONS}
          value={values.position}
          error={errors.position}
          onChange={setField("position")}
        />
      </div>

      <SelectField
        id="aiExperience"
        label="AI 도구 사용 경험"
        options={AI_EXPERIENCES}
        value={values.aiExperience}
        error={errors.aiExperience}
        onChange={setField("aiExperience")}
      />

      <SelectField
        id="interest"
        label="강의에서 가장 배우고 싶은 것"
        options={INTERESTS}
        value={values.interest}
        error={errors.interest}
        onChange={setField("interest")}
      />

      <div>
        <label htmlFor="dietary" className={labelClass}>
          식이 제한이나 알레르기 <span className="text-slate-400">(선택)</span>
        </label>
        <input
          id="dietary"
          name="dietary"
          type="text"
          value={values.dietary}
          onChange={(e) => setField("dietary")(e.target.value)}
          placeholder="간식 준비 참고용"
          className={inputClass}
        />
      </div>

      {submitError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "신청 중..." : "신청하기"}
      </button>
    </form>
  );
}
