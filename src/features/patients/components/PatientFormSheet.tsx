"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DoctorCombobox } from "@/components/common/DoctorCombobox";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toApiError } from "@/lib/api-error";
import { BLOOD_GROUPS, CONDITIONS, GENDERS } from "@/lib/constants";
import { formatDate, fromYmd, toYmd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCreatePatient, useUpdatePatient } from "../hooks";
import { patientSchema, type PatientFormValues } from "../schemas";
import type { Patient, PatientInput } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  /** Preset + locked doctor (doctor-detail page). */
  lockedDoctor?: { id: string; name: string } | null;
};

const today = () => toYmd(new Date());

const toValues = (p?: Patient | null, locked?: Props["lockedDoctor"]): PatientFormValues => ({
  name: p?.name ?? "",
  age: (p?.age ?? undefined) as number,
  gender: (p?.gender ?? undefined) as PatientFormValues["gender"],
  bloodGroup: p?.bloodGroup ?? undefined,
  phone: p?.phone ?? "",
  email: p?.email ?? "",
  address: p?.address ?? "",
  doctorId: p?.doctor.id ?? locked?.id ?? "",
  diagnosis: p?.diagnosis ?? "",
  condition: (p?.condition ?? undefined) as PatientFormValues["condition"],
  visitDate: p ? p.visitDate.slice(0, 10) : today(),
  notes: p?.notes ?? "",
});

export function PatientFormSheet({ open, onOpenChange, patient, lockedDoctor }: Props) {
  const guard = useRef<() => boolean>(() => false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const requestClose = () => {
    if (guard.current()) setConfirmDiscard(true);
    else onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => (o ? onOpenChange(true) : requestClose())}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
          {open && (
            <PatientForm
              patient={patient}
              lockedDoctor={lockedDoctor}
              guardRef={guard}
              onCancel={requestClose}
              onDone={() => onOpenChange(false)}
            />
          )}
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Discard changes?"
        description="You have unsaved changes. If you leave now they will be lost."
        confirmLabel="Discard"
        destructive
        onConfirm={() => {
          setConfirmDiscard(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}

function PatientForm({
  patient,
  lockedDoctor,
  guardRef,
  onCancel,
  onDone,
}: {
  patient?: Patient | null;
  lockedDoctor?: Props["lockedDoctor"];
  guardRef: React.RefObject<() => boolean>;
  onCancel: () => void;
  onDone: () => void;
}) {
  const editing = !!patient;
  const create = useCreatePatient(lockedDoctor?.id);
  const update = useUpdatePatient();
  const pending = create.isPending || update.isPending;
  const [dateOpen, setDateOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, dirtyFields, isDirty },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: toValues(patient, lockedDoctor),
  });

  useEffect(() => {
    guardRef.current = () => isDirty && !pending;
  }, [guardRef, isDirty, pending]);

  const notes = watch("notes") ?? "";

  async function onSubmit(values: PatientFormValues) {
    try {
      if (editing) {
        const keys = Object.keys(dirtyFields) as (keyof PatientFormValues)[];
        if (keys.length === 0) return onDone();
        // PATCH sends only the fields the user actually changed.
        const body = Object.fromEntries(keys.map((k) => [k, values[k]])) as Partial<PatientInput>;
        await update.mutateAsync({ id: patient!.id, body });
        toast.success("Patient updated");
      } else {
        const { email, address, notes: n, bloodGroup, ...rest } = values;
        await create.mutateAsync({
          ...rest,
          ...(email ? { email } : {}),
          ...(address ? { address } : {}),
          ...(n ? { notes: n } : {}),
          ...(bloodGroup ? { bloodGroup } : {}),
        } as PatientInput);
        toast.success("Patient added");
      }
      onDone();
    } catch (err) {
      const e = toApiError(err);
      if (e.status === 400 && e.details.length) {
        e.details.forEach((d) =>
          setError((d.path === "doctor" ? "doctorId" : d.path) as keyof PatientFormValues, {
            message: d.message,
          }),
        );
      } else {
        toast.error(e.message, { description: e.requestId && `Request ID: ${e.requestId}` });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
      <SheetHeader className="border-b p-4 sm:p-6">
        <SheetTitle>{editing ? "Edit patient" : "Add patient"}</SheetTitle>
        <SheetDescription>
          {editing
            ? "Only the fields you change are saved."
            : lockedDoctor
              ? `New patient for ${lockedDoctor.name}.`
              : "Create a patient and assign a doctor."}
        </SheetDescription>
      </SheetHeader>

      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto p-4 sm:p-6">
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold">Personal</legend>
          <FormField label="Full name" error={errors.name?.message} required>
            {(a) => <Input {...a} autoComplete="off" {...register("name")} />}
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Age" error={errors.age?.message} required>
              {(a) => (
                <Input
                  {...a}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={130}
                  {...register("age", { valueAsNumber: true })}
                />
              )}
            </FormField>
            <FormField label="Gender" error={errors.gender?.message} required>
              {(a) => (
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger {...a} className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </FormField>
            <FormField label="Blood group" error={errors.bloodGroup?.message}>
              {(a) => (
                <Controller
                  control={control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
                    >
                      <SelectTrigger {...a} className="w-full">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not set</SelectItem>
                        {BLOOD_GROUPS.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Phone" error={errors.phone?.message} required>
              {(a) => (
                <Input
                  {...a}
                  type="tel"
                  autoComplete="off"
                  placeholder="+8801811223344"
                  {...register("phone")}
                />
              )}
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              {(a) => (
                <Input
                  {...a}
                  type="email"
                  autoComplete="off"
                  placeholder="Optional"
                  {...register("email")}
                />
              )}
            </FormField>
          </div>
          <FormField label="Address" error={errors.address?.message}>
            {(a) => (
              <Input {...a} autoComplete="off" placeholder="Optional" {...register("address")} />
            )}
          </FormField>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold">Clinical</legend>
          <FormField label="Doctor" error={errors.doctorId?.message} required>
            {(a) => (
              <Controller
                control={control}
                name="doctorId"
                render={({ field }) => (
                  <DoctorCombobox
                    id={a.id}
                    invalid={a["aria-invalid"]}
                    describedBy={a["aria-describedby"]}
                    value={field.value || null}
                    selectedLabel={
                      lockedDoctor?.name ??
                      (patient && field.value === patient.doctor.id
                        ? patient.doctor.name
                        : undefined)
                    }
                    disabled={!!lockedDoctor}
                    onChange={(id) => field.onChange(id ?? "")}
                  />
                )}
              />
            )}
          </FormField>
          <FormField label="Diagnosis" error={errors.diagnosis?.message} required>
            {(a) => <Input {...a} autoComplete="off" {...register("diagnosis")} />}
          </FormField>

          <Controller
            control={control}
            name="condition"
            render={({ field }) => (
              <fieldset className="space-y-1.5">
                <legend className="text-sm leading-none font-medium">
                  Condition{" "}
                  <span className="text-rose-600" aria-hidden>
                    *
                  </span>
                </legend>
                <div
                  role="radiogroup"
                  aria-label="Condition"
                  className="grid grid-cols-2 gap-2 pt-1.5"
                >
                  {CONDITIONS.map((c) => {
                    const on = field.value === c.value;
                    return (
                      <label
                        key={c.value}
                        className={cn(
                          "has-[:focus-visible]:ring-ring/50 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm has-[:focus-visible]:ring-2",
                          on ? "border-primary bg-accent/60 font-medium" : "hover:bg-muted/60",
                        )}
                      >
                        <input
                          type="radio"
                          name="condition"
                          value={c.value}
                          checked={on}
                          onChange={() => field.onChange(c.value)}
                          className="sr-only"
                        />
                        <span className={cn("size-2.5 shrink-0 rounded-full", c.dot)} aria-hidden />
                        <span className="min-w-0 leading-tight">{c.label}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.condition && (
                  <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
                    {errors.condition.message}
                  </p>
                )}
              </fieldset>
            )}
          />

          <FormField label="Visit date" error={errors.visitDate?.message} required>
            {(a) => (
              <Controller
                control={control}
                name="visitDate"
                render={({ field }) => (
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        {...a}
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon aria-hidden />
                        {field.value ? formatDate(fromYmd(field.value)) : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? fromYmd(field.value) : undefined}
                        onSelect={(d) => {
                          if (d) field.onChange(toYmd(d));
                          setDateOpen(false);
                        }}
                        disabled={{ after: new Date() }}
                        defaultMonth={field.value ? fromYmd(field.value) : undefined}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            )}
          </FormField>

          <FormField label="Notes" error={errors.notes?.message} hint={`${notes.length}/1000`}>
            {(a) => (
              <Textarea
                {...a}
                rows={4}
                maxLength={1000}
                placeholder="Optional clinical notes"
                {...register("notes")}
              />
            )}
          </FormField>
        </fieldset>
      </div>

      <SheetFooter className="flex-row justify-end gap-2 border-t p-4 sm:p-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {editing ? "Save changes" : "Add patient"}
        </Button>
      </SheetFooter>
    </form>
  );
}
