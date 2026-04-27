import { useParams } from "react-router-dom";
import Filters from "../components/layout/Filters";
import Clock from "../components/layout/Clock";
import Smartwatch from "../components/layout/Smartwatch";
import Wristwatch from "../components/layout/Wristwatch";
import Pocketwatch from "../components/layout/Pocketwatch";

const COMPONENTS = {
  clock: Clock,
  smartwatch: Smartwatch,
  wristwatch: Wristwatch,
  pocketwatch: Pocketwatch,
};

export default function WatchCategoryPage() {
  const { category } = useParams();

  console.log("cc ", category);

  const SelectedComponent = category
    ? COMPONENTS[category as keyof typeof COMPONENTS]
    : null;

  if (!SelectedComponent) {
    return <div className="p-10 text-center">Nincs ilyen kategória.</div>;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <SelectedComponent />

        <div className="container mx-auto px-4">
          <Filters />
        </div>
      </div>
    </>
  );
}
