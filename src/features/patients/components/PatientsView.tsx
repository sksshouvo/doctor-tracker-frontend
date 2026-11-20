"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { PatientFormSheet } from "./PatientFormSheet";
import { PatientsTable } from "./PatientsTable";

export function PatientsView() {
  const [creating, setCreating] = useState(false);
  return (
    <>
      <PageHeader
        title="Patients"
        description="Search, filter and manage every patient"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus aria-hidden /> Add patient
          </Button>
        }
      />
      <PatientsTable openCreate={() => setCreating(true)} />
      <PatientFormSheet open={creating} onOpenChange={setCreating} />
    </>
  );
}
