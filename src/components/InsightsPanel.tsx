import { Brain, AlertTriangle, Pill, FileText } from "lucide-react";

interface TopPrediction {
  label: string;
  score: number;
  risk: string;
}

interface InsightData {
  predictedSymptom: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  topPredictions: TopPrediction[];
  recentSymptoms: any[];
  relatedMedications: any[];
}

interface InsightsPanelProps extends InsightData {}

const InsightsPanel = ({
  predictedSymptom,
  risk,
  topPredictions,
  recentSymptoms,
  relatedMedications,
}: InsightsPanelProps) => {
  const riskColors = {
    LOW: "bg-green-100 text-green-700 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
    HIGH: "bg-red-100 text-red-700 border-red-200",
  };

  const riskIcons = {
    LOW: "✅",
    MEDIUM: "⚕️",
    HIGH: "⚠️",
  };

  // Get last 5 symptoms
  const lastSymptoms = recentSymptoms
    .slice(0, 5)
    .map((s) => s.description || s.text || "Unknown symptom")
    .filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mt-4 max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-foreground">🧠 Insights Summary</h3>
      </div>

      <div className="space-y-4">
        {/* Predicted Pattern & Risk */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Predicted pattern</p>
            <p className="font-medium text-foreground">{predictedSymptom || "Unknown"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{riskIcons[risk]}</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${riskColors[risk]}`}
            >
              {risk} RISK
            </span>
          </div>
        </div>

        {/* Top ClinicalBERT Predictions */}
        {topPredictions && topPredictions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <p className="text-sm font-medium text-foreground">Top signals</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {topPredictions.slice(0, 3).map((pred, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                >
                  {pred.label} ({typeof pred.score === "number" ? pred.score.toFixed(2) : pred.score})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent Symptoms */}
        {lastSymptoms.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-medium text-foreground">Recent symptoms</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {lastSymptoms.join(", ")}
            </p>
          </div>
        )}

        {/* Related Medications */}
        {relatedMedications && relatedMedications.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-4 w-4 text-indigo-500" />
              <p className="text-sm font-medium text-foreground">Related medications</p>
            </div>
            <div className="space-y-1">
              {relatedMedications.slice(0, 3).map((med, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">
                  {med.medication_name || med.name} {med.dosage ? `(${med.dosage})` : ""}
                </p>
              ))}
            </div>
          </div>
        )}

        {lastSymptoms.length === 0 && (!relatedMedications || relatedMedications.length === 0) && (
          <p className="text-sm text-muted-foreground italic">
            No recent symptoms or medications logged yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;

