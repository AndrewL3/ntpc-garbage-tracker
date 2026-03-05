import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import StationDetailContent from "./StationDetailContent";
import type { YouBikeStation } from "../api/client";

interface StationDetailProps {
  station: YouBikeStation | null;
  onClose: () => void;
}

export default function StationDetail({
  station,
  onClose,
}: StationDetailProps) {
  return (
    <Drawer
      open={station !== null}
      onOpenChange={(open) => !open && onClose()}
      modal={false}
    >
      <DrawerContent>
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted-foreground/20" />
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg font-bold">
            {station?.name}
          </DrawerTitle>
          <p className="text-sm text-muted-foreground">{station?.nameEn}</p>
        </DrawerHeader>
        <div className="px-5 pb-8">
          {station && <StationDetailContent station={station} />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
