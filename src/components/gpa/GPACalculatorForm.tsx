
import { PlusCircle, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Course } from "@/types/gpa";
import { FormEvent } from "react";

interface GPACalculatorFormProps {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export const GPACalculatorForm = ({
  courses,
  setCourses,
  onCalculate,
  onReset,
}: GPACalculatorFormProps) => {
  const addCourse = () => {
    setCourses([
      ...courses,
      {
        id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
        courseCode: "",
        creditLoad: 0,
        grade: "A",
      },
    ]);
  };

  const removeCourse = (id: number) => {
    if (courses.length > 1) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  const updateCourse = (id: number, field: keyof Course, value: string | number) => {
    setCourses(
      courses.map(course => {
        if (course.id === id) {
          return {
            ...course,
            [field]: field === "creditLoad" ? parseFloat(value as string) || 0 : value,
          };
        }
        return course;
      })
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onCalculate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {courses.map(course => (
          <div key={course.id} className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 sm:col-span-5">
              <Input
                placeholder="Course Code (e.g. CEE 101)"
                value={course.courseCode}
                onChange={e => updateCourse(course.id, "courseCode", e.target.value)}
                required
              />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <Input
                type="number"
                placeholder="Credits"
                min="0"
                step="0.5"
                value={course.creditLoad || ""}
                onChange={e => updateCourse(course.id, "creditLoad", e.target.value)}
                required
              />
            </div>
            <div className="col-span-6 sm:col-span-4">
              <Select
                value={course.grade}
                onValueChange={value => updateCourse(course.id, "grade", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A (5 points)</SelectItem>
                  <SelectItem value="B">B (4 points)</SelectItem>
                  <SelectItem value="C">C (3 points)</SelectItem>
                  <SelectItem value="D">D (2 points)</SelectItem>
                  <SelectItem value="E">E (1 point)</SelectItem>
                  <SelectItem value="F">F (0 points)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCourse(course.id)}
                disabled={courses.length === 1}
              >
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="button" variant="outline" onClick={addCourse}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Course
        </Button>
        <div className="flex-grow" />
        <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600">
          Calculate GPA
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Reset All Fields
        </Button>
      </div>
    </form>
  );
};
