import { useState } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, FileSpreadsheet, UploadCloud } from "lucide-react";
import { auth } from "../firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_UI = {
  idle: {
    icon: FileSpreadsheet,
    title: "Ready to import",
    message: "Upload a CSV, XLSX, or XLS file to refresh your asset inventory.",
    tone: "border-slate-200 bg-slate-50 text-slate-600",
  },
  uploading: {
    icon: UploadCloud,
    title: "Uploading asset file",
    message: "Your file is being processed and synced into AssetFlow.",
    tone: "border-blue-200 bg-blue-50 text-blue-700",
  },
  success: {
    icon: CheckCircle2,
    title: "Import complete",
    message: "Your assets were uploaded successfully and should appear in inventory shortly.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  error: {
    icon: AlertCircle,
    title: "Import failed",
    message: "Something went wrong while uploading. Please try again or verify the backend is running.",
    tone: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

function getImportErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }

    if (error.request) {
      return "Could not reach the upload server at http://localhost:8000. Make sure the backend is running, then try again.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Import failed.";
}

export default function ImportPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [statusDetail, setStatusDetail] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first");
      return;
    }

    setStatus("uploading");
    setStatusDetail("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", user.uid);

    try {
      const response = await axios.post("http://localhost:8000/upload", formData);
      const data = response.data ?? {};

      if (!Object.prototype.hasOwnProperty.call(data, "importedCount")) {
        throw new Error("Upload API returned an outdated response. Restart the backend server, then try the import again.");
      }

      const importedCount = Number(data.importedCount);

      if (!Number.isFinite(importedCount)) {
        throw new Error("Upload API returned an invalid import count. Restart the backend server and try again.");
      }

      if (importedCount <= 0) {
        throw new Error("The file was accepted, but zero rows were imported. Check that the spreadsheet has a header row and at least one data row.");
      }

      setStatus("success");
      setStatusDetail(`${importedCount} asset${importedCount === 1 ? "" : "s"} imported to Firestore.`);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setStatusDetail(getImportErrorMessage(error));
    }
  };

  const statusConfig = STATUS_UI[status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.78fr]">
      <Card className="rounded-[1.5rem] border-white/55 bg-white/62 py-0 shadow-[0_18px_40px_rgba(15,23,42,0.07)] backdrop-blur-xl">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="rounded-[1.3rem] border border-dashed border-blue-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(239,246,255,0.86))] p-4 sm:p-5 lg:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-gradient-to-br from-slate-950 via-blue-900 to-cyan-500 text-white shadow-[0_14px_28px_rgba(37,99,235,0.18)]">
              <UploadCloud className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Bulk import asset data</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Drop in a spreadsheet to refresh your asset register. AssetFlow will tag records to the current user during upload.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <label className="mb-2.5 block text-sm font-medium text-slate-700">Choose file</label>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-3 file:rounded-[0.8rem] file:border-0 file:bg-slate-950 file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || status === "uploading"}
                className="h-11 rounded-[1rem] bg-[linear-gradient(135deg,#0f172a,#1d4ed8_58%,#38bdf8)] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.24)] hover:brightness-110"
              >
                {status === "uploading" ? "Uploading..." : "Start Import"}
              </Button>
            </div>

            {file ? (
              <div className="mt-5 rounded-[1rem] border border-slate-200/70 bg-white/75 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Selected File</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{file.name}</p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] border border-slate-900/85 bg-[linear-gradient(160deg,rgba(15,23,42,0.92),rgba(30,41,59,0.92),rgba(37,99,235,0.78))] py-0 text-white shadow-[0_22px_50px_rgba(15,23,42,0.18)]">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className={`rounded-[1.2rem] border p-4 ${statusConfig.tone}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] bg-white/70">
                <StatusIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Import Status</p>
                <h3 className="mt-1 text-base font-semibold">{statusConfig.title}</h3>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6">{statusDetail || statusConfig.message}</p>
          </div>

          <div className="mt-4 space-y-2.5">
            <ChecklistItem text="Use CSV, XLSX, or XLS formats." />
            <ChecklistItem text="Each row will be stored as a new asset record." />
            <ChecklistItem text="The current user ID is attached during upload for ownership." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChecklistItem({ text }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/6 px-3.5 py-3 text-sm leading-5 text-white/78">
      {text}
    </div>
  );
}
