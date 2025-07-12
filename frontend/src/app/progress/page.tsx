import CategoryAccuracyHeatmap from '@/components/CategoryAccuracyHeatmap';

export default function ProgressPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">学習進捗</h1>
      <CategoryAccuracyHeatmap />
    </div>
  );
}
