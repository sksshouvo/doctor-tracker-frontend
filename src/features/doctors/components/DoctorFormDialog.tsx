"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toApiError } from "@/lib/api-error";
import { useCreateDoctor, useDoctorFacetsQuery, useUpdateDoctor } from "../hooks";
import { doctorSchema, type DoctorFormValues } from "../schemas";
import type { Doctor } from "../types";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; doctor?: Doctor | null };

const EMPTY: DoctorFormValues = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};

/** The dialog body only mounts while open, so the form (and its listeners) don't exist otherwise. */
export function DoctorFormDialog({ open, onOpenChange, doctor }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && <DoctorForm doctor={doctor} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function DoctorForm({ doctor, onDone }: { doctor?: Doctor | null; onDone: () => void }) {
  const editing = !!doctor;
  const create = useCreateDoctor();
  const update = useUpdateDoctor();
  const facets = useDoctorFacetsQuery();
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors, dirtyFields },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: doctor
      ? {
          name: doctor.name,
          specialization: doctor.specialization,
          hospital: doctor.hospital,
          phone: doctor.phone,
          email: doctor.email,
        }
      : EMPTY,
  });

  useEffect(() => {
    reset(
      doctor
        ? {
            name: doctor.name,
            specialization: doctor.specialization,
            hospital: doctor.hospital,
            phone: doctor.phone,
            email: doctor.email,
          }
        : EMPTY,
    );
  }, [doctor, reset]);

  async function onSubmit(values: DoctorFormValues) {
    try {
      if (editing) {
        const changed = Object.keys(dirtyFields) as (keyof DoctorFormValues)[];
        if (changed.length === 0) return onDone();
        await update.mutateAsync({
          id: doctor!.id,
          body: Object.fromEntries(changed.map((k) => [k, values[k]])),
        });
        toast.success("Doctor updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Doctor added");
      }
      onDone();
    } catch (err) {
      const e = toApiError(err);
      if (e.status === 409) {
        setError("email", { message: "A doctor with this email already exists" });
        setFocus("email");
      } else if (e.status === 400 && e.details.length) {
        e.details.forEach((d) =>
          setError(d.path as keyof DoctorFormValues, { message: d.message }),
        );
      } else {
        toast.error(e.message, { description: e.requestId && `Request ID: ${e.requestId}` });
      }
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit doctor" : "Add doctor"}</DialogTitle>
        <DialogDescription>
          {editing
            ? "Update this doctor's details."
            : "Create a doctor record. You can add patients afterwards."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label="Full name" error={errors.name?.message} required>
          {(a) => (
            <Input
              {...a}
              autoComplete="off"
              placeholder="Dr. Ayesha Rahman"
              autoFocus
              {...register("name")}
            />
          )}
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Specialization" error={errors.specialization?.message} required>
            {(a) => (
              <>
                <Input
                  {...a}
                  list="specialization-options"
                  autoComplete="off"
                  placeholder="Cardiology"
                  {...register("specialization")}
                />
                <datalist id="specialization-options">
                  {facets.data?.specializations.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </>
            )}
          </FormField>
          <FormField label="Hospital" error={errors.hospital?.message} required>
            {(a) => (
              <>
                <Input
                  {...a}
                  list="hospital-options"
                  autoComplete="off"
                  placeholder="Square Hospital"
                  {...register("hospital")}
                />
                <datalist id="hospital-options">
                  {facets.data?.hospitals.map((h) => (
                    <option key={h} value={h} />
                  ))}
                </datalist>
              </>
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
                placeholder="+8801711000000"
                {...register("phone")}
              />
            )}
          </FormField>
          <FormField label="Email" error={errors.email?.message} required>
            {(a) => (
              <Input
                {...a}
                type="email"
                autoComplete="off"
                placeholder="doctor@hospital.com"
                {...register("email")}
              />
            )}
          </FormField>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            {editing ? "Save changes" : "Add doctor"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
