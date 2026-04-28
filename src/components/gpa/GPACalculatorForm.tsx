import { PlusCircle, Trash2, Download, Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Course, GRADE_POINTS } from "@/types/gpa";
import { FormEvent, useRef } from "react";
import { toast } from "sonner";

interface Props {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export const GPACalculatorForm = ({ courses, setCourses, onCalculate, onReset }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextId = () => (courses.length ? Math.max(...courses.map((c) => c.id)) + 1 : 1);

  const addCourse = () =>
    setCourses([...courses, { id: nextId(), courseCode: "", creditLoad: 0, grade: "A" }]);

  const addMultiple = () => {
    const start = nextId();
    setCourses([
      ...courses,
      ...Array.from({ length: 5 }, (_, i) => ({
        id: start + i,
        courseCode: "",
        creditLoad: 0,
        grade: "A",
      })),
    ]);
    toast.success("Added 5 course rows");
  };

  const removeCourse = (id: number) => {
    if (courses.length > 1) setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (id: number, field: keyof Course, value: string | number) =>
    setCourses(
      courses.map((c) =>
        c.id === id
          ? {
              ...c,
              [field]: field === "creditLoad" ? parseFloat(value as string) || 0 : value,
            }
          : c
      )
    );

  const exportJSON = () => {
    const payload = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      courses,
    };
    const uri =
      "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement("a");
    link.href = uri;
    link.download = `gpa-courses-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    toast.success("Exported as JSON");
  };

  const exportCSV = () => {
    const header = "Course Code,Credit Units,Grade,Grade Point,Quality Points";
    const rows = courses.map((c) => {
      const gp = GRADE_POINTS[c.grade] ?? 0;
      const qp = c.creditLoad * gp;
      return [c.courseCode, c.creditLoad, c.grade, gp, qp].join(",");
    });
    const csv = [header, ...rows].join("\n");
    const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const link = document.createElement("a");
    link.href = uri;
    link.download = `gpa-courses-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Exported as CSV");
  };

  const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("File too large (max 1MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        const list: any[] = Array.isArray(content) ? content : content.courses ?? [];
        const valid = list.filter(
          (c) =>
            c &&
            typeof c.courseCode === "string" &&
            typeof c.creditLoad === "number" &&
            typeof c.grade === "string" &&
            ["A", "B", "C", "D", "E", "F"].includes(c.grade)
        );
        if (!valid.length) {
          toast.error("No valid courses found");
          return;
        }
        setCourses(valid.map((c, i) => ({ ...c, id: i + 1 })));
        toast.success(`Imported ${valid.length} courses`);
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onCalculate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border">
        <span className="text-xs text-muted-foreground mr-auto">
          {courses.length} course{courses.length !== 1 ? "s" : ""}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportJSON}>
              <Download className="mr-2 h-4 w-4" /> JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addMultiple}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add 5
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={importJSON}
          className="hidden"
        />
      </div>

      {/* Header */}
      <div className="grid grid-cols-12 gap-3 items-center text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <div className="col-span-12 sm:col-span-5">Course</div>
        <div className="col-span-3 sm:col-span-2">Credits</div>
        <div className="col-span-5 sm:col-span-3">Grade</div>
        <div className="col-span-3 sm:col-span-1 text-right">Pts</div>
        <div className="col-span-1 text-right" />
      </div>

      {/* Rows */}
      <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
        {courses.map((course) => {
          const qp = course.creditLoad * (GRADE_POINTS[course.grade] ?? 0);
          return (
            <div
              key={course.id}
              className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg border border-border bg-background hover:bg-muted/40 transition-base"
            >
              <div className="col-span-12 sm:col-span-5">
                <Input
                  placeholder="e.g. CSC 101"
                  value={course.courseCode}
                  onChange={(e) => updateCourse(course.id, "courseCode", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  placeholder="0"
                  value={course.creditLoad || ""}
                  onChange={(e) => updateCourse(course.id, "creditLoad", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="col-span-5 sm:col-span-3">
                <Select
                  value={course.grade}
                  onValueChange={(v) => updateCourse(course.id, "grade", v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GRADE_POINTS).map(([g, p]) => (
                      <SelectItem key={g} value={g}>
                        {g} — {p.toFixed(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3 sm:col-span-1 text-right tabular-nums text-sm font-medium">
                {qp.toFixed(1)}
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCourse(course.id)}
                  disabled={courses.length === 1}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  aria-label="Remove course"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={addCourse}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add course
        </Button>
        <div className="flex-grow" />
        <Button type="button" variant="ghost" onClick={onReset}>
          Reset
        </Button>
        <Button type="submit">Calculate GPA</Button>
      </div>
    </form>
  );
};
