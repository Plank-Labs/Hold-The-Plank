import AppLayout from "@/components/layout/AppLayout";
import GymQRScanner from "@/components/GymQRScanner";
import { useNavigate } from "react-router-dom";

export default function GymScan() {
    const navigate = useNavigate();

    return (
        <AppLayout>
            <div className="pt-10">
                <GymQRScanner onClose={() => navigate('/')} />
            </div>
        </AppLayout>
    );
}
