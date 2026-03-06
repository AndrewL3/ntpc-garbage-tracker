import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import TaipeiStopDetailContent from "./TaipeiStopDetailContent";
import type { TaipeiGarbageStop } from "../api/taipei-client";

interface TaipeiStopDetailProps {
  stop: TaipeiGarbageStop | null;
  onClose: () => void;
}

export default function TaipeiStopDetail({
  stop,
  onClose,
}: TaipeiStopDetailProps) {
  return (
    <Drawer
      open={stop !== null}
      onOpenChange={(open) => !open && onClose()}
      modal={false}
    >
      <DrawerContent>
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted-foreground/20" />
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg font-bold">
            {stop?.address}
          </DrawerTitle>
          <p className="text-sm text-muted-foreground">
            {stop?.routeName} {stop?.trip}
          </p>
        </DrawerHeader>
        <div className="px-5 pb-8">
          {stop && <TaipeiStopDetailContent stop={stop} />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
