import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { Button } from "./components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, QrCodeIcon } from "lucide-react";
import { toast } from "sonner";

function App() {
  const [text, setText] = useState("");
  const [size, setSize] = useState([256]);
  const [marginSize, setMarginSize] = useState([2]);
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <>
      <div className="pt-12 md:pt-0 md:flex overflow-hidden justify-between items-center-safe min-h-screen max-w-3xl gap-4 mx-auto">
        <Card className="p-4 m-4">
          <div className="flex justify-between gap-6">
            <h1 className="inline-flex items-center gap-2 text-3xl font-bold ">
              <QrCodeIcon /> QR Generator
            </h1>
            <ModeToggle />
          </div>
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="data">Text or URL</Label>
            <Input
              maxLength={221}
              value={text}
              onChange={(e) => setText(e.target.value)}
              type="text"
              id="data"
              placeholder="Enter text, URL or any content..."
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="size">
              Size: {size[0]} x {size[0]} pixels
            </Label>
            <Slider
              value={size}
              onValueChange={(e) => setSize(e)}
              step={32}
              min={128}
              max={512}
            />
            <div className="flex justify-between">
              <Label htmlFor="size" className="dark:text-neutral-400">
                128px
              </Label>
              <Label htmlFor="size" className="dark:text-neutral-400">
                512px
              </Label>
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="size">Margin Size: {marginSize}</Label>
            <Slider
              value={marginSize}
              onValueChange={(e) => setMarginSize(e)}
              step={1}
              min={1}
              max={10}
            />
            <div className="flex justify-between">
              <Label htmlFor="size" className="dark:text-neutral-400">
                1
              </Label>
              <Label htmlFor="size" className="dark:text-neutral-400">
                10
              </Label>
            </div>
          </div>

          <div className="flex gap-2 justify-start">
            <Button
              className="cursor-pointer"
              disabled={!text}
              onClick={() => {
                if (!svgRef.current) return;
                const svg = svgRef.current;
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                const img = new Image();
                const svgBlob = new Blob([svgData], {
                  type: "image/svg+xml;charset=utf-8",
                });
                const url = URL.createObjectURL(svgBlob);
                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx.drawImage(img, 0, 0);
                  URL.revokeObjectURL(url);
                  const pngUrl = canvas.toDataURL("image/png");
                  const downloadLink = document.createElement("a");
                  downloadLink.href = pngUrl;
                  downloadLink.download = "qrcode.png";
                  document.body.appendChild(downloadLink);
                  downloadLink.click();
                  document.body.removeChild(downloadLink);
                };
                img.src = url;
              }}
              variant={"outline"}
            >
              <Download /> PNG
            </Button>
            <Button
              className="cursor-pointer"
              disabled={!text}
              onClick={() => {
                if (!svgRef.current) return;
                const svg = svgRef.current;
                const svgData = new XMLSerializer().serializeToString(svg);
                const svgBlob = new Blob([svgData], {
                  type: "image/svg+xml;charset=utf-8",
                });
                const svgUrl = URL.createObjectURL(svgBlob);
                const downloadLink = document.createElement("a");
                downloadLink.href = svgUrl;
                downloadLink.download = "qrcode.svg";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(svgUrl);
              }}
              variant={"outline"}
            >
              <Download />
              SVG
            </Button>
            <Button
              className="cursor-pointer"
              disabled={!text}
              onClick={async () => {
                if (!svgRef.current) return;
                const svg = svgRef.current;
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                  toast.error("Failed to copy QR Code to clipboard.");
                  return;
                }
                const img = new Image();
                const svgBlob = new Blob([svgData], {
                  type: "image/svg+xml;charset=utf-8",
                });
                const url = URL.createObjectURL(svgBlob);
                img.onload = async () => {
                  canvas.width = size[0];
                  canvas.height = size[0];
                  ctx.drawImage(img, 0, 0, size[0], size[0]);
                  URL.revokeObjectURL(url);
                  canvas.toBlob(async (blob) => {
                    if (!blob) {
                      toast.error("Failed to copy QR Code to clipboard.");
                      return;
                    }
                    try {
                      console.log(blob);
                      await navigator.clipboard
                        .write([
                          new window.ClipboardItem({ "image/png": blob }),
                        ])
                        .then();
                      toast.success("QR Code copied to clipboard!");
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (err) {
                      // fallback for browsers that don't support ClipboardItem
                      const reader = new FileReader();
                      reader.onload = () => {
                        const dataUrl = reader.result as string;
                        navigator.clipboard.writeText(dataUrl);
                      };
                      reader.readAsDataURL(blob);
                      toast.success("QR Code copied to clipboard!");
                    }
                  }, "image/png");
                };
                img.src = url;
              }}
              variant={"outline"}
            >
              <Copy />
              Copy
            </Button>
          </div>
        </Card>
        <div className=" mt-12 md:mt-0 flex justify-center items-center-safe p-4 mx-4">
          <QRCodeSVG
            ref={svgRef}
            className="md:w-72 md:h-72"
            value={text}
            size={size[0]}
            level="Q"
            title={`QR Code for "${text}"`}
            marginSize={marginSize[0]}
          />
        </div>
      </div>
    </>
  );
}

export default App;
