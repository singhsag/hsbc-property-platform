"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PropertyInput } from "@/lib/types";

// Empty inputs arrive as "" — Number("") is 0, which would silently pass
// .min(0) fields (distance, school_rating) and send 0 to the model, producing
// nonsense (e.g. negative prices). Coerce blank/empty to NaN so z.number()
// rejects it with a clear "Required" message instead.
const num = (build: (s: z.ZodNumber) => z.ZodNumber) =>
  z.preprocess(
    (v) => {
      if (v === null || v === undefined) return NaN;
      if (typeof v === "string" && v.trim() === "") return NaN;
      return Number(v);
    },
    build(z.number({ invalid_type_error: "Required" }))
  );

const schema = z.object({
  square_footage: num((s) => s.positive("Must be positive")),
  bedrooms: num((s) => s.int("Whole number").min(1).max(20)),
  bathrooms: num((s) => s.min(0.5).max(20)),
  year_built: num((s) => s.int("Whole number").min(1800).max(2030)),
  lot_size: num((s) => s.positive("Must be positive")),
  distance_to_city_center: num((s) => s.min(0)),
  school_rating: num((s) => s.min(0).max(10)),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: PropertyInput) => void;
  loading: boolean;
  submitLabel?: string;
  defaultValues?: Partial<FormValues>;
}

const fields: {
  name: keyof FormValues;
  label: string;
  step: string;
  placeholder: string;
}[] = [
  { name: "square_footage", label: "Square Footage (sq ft)", step: "1", placeholder: "e.g. 1850" },
  { name: "bedrooms", label: "Bedrooms", step: "1", placeholder: "e.g. 3" },
  { name: "bathrooms", label: "Bathrooms", step: "0.5", placeholder: "e.g. 2" },
  { name: "year_built", label: "Year Built", step: "1", placeholder: "e.g. 2001" },
  { name: "lot_size", label: "Lot Size (sq ft)", step: "1", placeholder: "e.g. 7500" },
  { name: "distance_to_city_center", label: "Distance to City Centre (miles)", step: "0.1", placeholder: "e.g. 4.5" },
  { name: "school_rating", label: "School Rating (0–10)", step: "0.1", placeholder: "e.g. 8.2" },
];

export function EstimatorForm({
  onSubmit,
  loading,
  submitLabel = "Get Estimate",
  defaultValues,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(({ name, label, step, placeholder }) => (
          <div key={name} className="flex flex-col gap-1">
            <label
              htmlFor={name}
              className="text-sm font-medium text-slate-700"
            >
              {label}
            </label>
            <input
              id={name}
              type="number"
              step={step}
              placeholder={placeholder}
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? `${name}-error` : undefined}
              className={`rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors[name]
                  ? "border-red-400 bg-red-50"
                  : "border-slate-300 bg-white"
              }`}
              {...register(name)}
            />
            {errors[name] && (
              <span
                id={`${name}-error`}
                className="text-xs text-red-600"
                role="alert"
              >
                {errors[name]?.message}
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60 transition-colors"
      >
        {loading ? "Calculating…" : submitLabel}
      </button>
    </form>
  );
}
