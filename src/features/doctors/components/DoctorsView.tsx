"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { DoctorFormDialog } from "./DoctorFormDialog";
import { DoctorsTable } from "./DoctorsTable";

export function DoctorsView() {
  const [creating, setCreating] = useState(false);
  return (
    <>
      <PageHeader
        title="Doctors"
        description="Manage doctors and their patients"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus aria-hidden /> Add doctor
          </Button>
        }
      />
      <DoctorsTable openCreate={() => setCreating(true)} />
      <DoctorFormDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
