import { HardDriveUpload } from "lucide-react";
import { primaryButton } from "@/components/common/styles";
import { useLegacyImport } from "@/hooks/useLegacyImport";

export function ImportBanner() {
  const legacy = useLegacyImport();
  if (!legacy.count || legacy.dismissed) return null;

  return (
    <section className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 mb-5 rounded-2xl border border-[#d39a3a]/40 bg-[#fdf3e1] animate-surface">
      <HardDriveUpload className="w-5 h-5 text-[#875d22] shrink-0" />
      <p className="m-0 flex-1 text-[#6b5531] text-xs leading-relaxed">
        <strong>We found {legacy.count} expense{legacy.count === 1 ? "" : "s"} saved in this browser</strong>{" "}
        from before you had an account. Move them to your account so they're backed up and available
        on every device.
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          className="px-3 py-2 rounded-xl text-[#7d6030] text-xs font-bold hover:bg-[#f6e5c4]"
          onClick={legacy.dismiss}
        >
          Not now
        </button>
        <button className={primaryButton} onClick={legacy.importAll} disabled={legacy.isImporting}>
          {legacy.isImporting ? "Importing…" : "Import them"}
        </button>
      </div>
    </section>
  );
}
