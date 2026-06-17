import { redirect } from "next/navigation";

export default function CaregiverPatientRedirect({ params }: { params: { patientId: string } }) {
    redirect(`/user/caregiver/${params.patientId}`);
}
