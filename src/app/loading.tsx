// src/app/loading.tsx
import Loader from '@/components/ui/Loader';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
      <Loader
        message="Loading Monitoring Dashboard..."
        subMessage="Aggregating master schools, completion metrics, and zonal deficits"
      />
    </div>
  );
}