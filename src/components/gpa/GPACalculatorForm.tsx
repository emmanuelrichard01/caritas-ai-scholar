
import { PlusCircle, Trash, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Course } from "@/types/gpa";
import { FormEvent, useRef } from "react";
import { toast } from "sonner";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const exportData = () => {
    // Create enhanced export data with metadata
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      totalCourses: courses.length,
      validCourses: courses.filter(c => c.courseCode.trim() !== "" && c.creditLoad > 0).length,
      courses: courses,
      metadata: {
        appName: "GPA Calculator",
        format: "Lovable StudyBuddy Export"
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const exportFileDefaultName = `gpa-courses-${timestamp}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success(`${courses.length} courses exported successfully!`);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Enhanced file validation
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      toast.error("Please select a valid JSON file");
      return;
    }

    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
      toast.error("File too large. Please select a file smaller than 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = JSON.parse(e.target?.result as string);
        
        // Handle both new format (with metadata) and legacy format (direct array)
        let coursesToImport: Course[] = [];
        
        if (Array.isArray(fileContent)) {
          // Legacy format - direct array of courses
          coursesToImport = fileContent;
        } else if (fileContent.courses && Array.isArray(fileContent.courses)) {
          // New format - with metadata
          coursesToImport = fileContent.courses;
        } else {
          toast.error("Invalid file format. Expected courses data.");
          return;
        }

        // Validate course structure
        const validCourses = coursesToImport.filter((course: any) => {
          return course && 
                 typeof course.id === 'number' && 
                 typeof course.courseCode === 'string' && 
                 typeof course.creditLoad === 'number' && 
                 typeof course.grade === 'string' &&
                 ['A', 'B', 'C', 'D', 'E', 'F'].includes(course.grade);
        });

        if (validCourses.length === 0) {
          toast.error("No valid courses found in the file");
          return;
        }

        // Reassign IDs to prevent conflicts
        const coursesWithNewIds = validCourses.map((course: Course, index: number) => ({
          ...course,
          id: index + 1
        }));

        setCourses(coursesWithNewIds);
        
        const skippedCount = coursesToImport.length - validCourses.length;
        if (skippedCount > 0) {
          toast.success(`${validCourses.length} courses imported successfully! ${skippedCount} invalid entries were skipped.`);
        } else {
          toast.success(`${validCourses.length} courses imported successfully!`);
        }
        
      } catch (error) {
        console.error('Import error:', error);
        toast.error("Error reading file. Please check if it's a valid JSON file.");
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading file. Please try again.");
    };
    
    reader.readAsText(file);
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const addMultipleCourses = () => {
    const newCourses = [];
    const startId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    
    for (let i = 0; i < 5; i++) {
      newCourses.push({
        id: startId + i,
        courseCode: "",
        creditLoad: 0,
        grade: "A",
      });
    }
    
    setCourses([...courses, ...newCourses]);
    toast.success("Added 5 course slots!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Import/Export Controls */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-lg border border-blue-200 dark:border-slate-600">
        <h3 className="text-sm font-medium mb-3 dark:text-white flex items-center gap-2">
          Course Management
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </span>
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={exportData}
            disabled={courses.length === 0}
            className="bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addMultipleCourses}
            className="bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add 5 Courses
          </Button>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Export your courses to backup or share. Import supports both new and legacy formats.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={importData}
          style={{ display: 'none' }}
        />
      </div>

      {/* Course List Header */}
      <div className="grid grid-cols-12 gap-3 items-center text-sm font-medium text-slate-600 dark:text-slate-400 border-b pb-2">
        <div className="col-span-12 sm:col-span-5">Course Code</div>
        <div className="col-span-4 sm:col-span-2">Credit Units</div>
        <div className="col-span-6 sm:col-span-4">Grade</div>
        <div className="col-span-2 sm:col-span-1">Action</div>
      </div>

      {/* Course Input Rows */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {courses.map(course => (
          <div key={course.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-white dark:bg-slate-900 rounded-lg border">
            <div className="col-span-12 sm:col-span-5">
              <Input
                placeholder="Course Code (e.g. CEE 101)"
                value={course.courseCode}
                onChange={e => updateCourse(course.id, "courseCode", e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <Input
                type="number"
                placeholder="Credits"
                min="0"
                max="10"
                step="0.5"
                value={course.creditLoad || ""}
                onChange={e => updateCourse(course.id, "creditLoad", e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <div className="col-span-6 sm:col-span-4">
              <Select
                value={course.grade}
                onValueChange={value => updateCourse(course.id, "grade", value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A (5.0 points)</SelectItem>
                  <SelectItem value="B">B (4.0 points)</SelectItem>
                  <SelectItem value="C">C (3.0 points)</SelectItem>
                  <SelectItem value="D">D (2.0 points)</SelectItem>
                  <SelectItem value="E">E (1.0 point)</SelectItem>
                  <SelectItem value="F">F (0.0 points)</SelectItem>
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
                className="h-8 w-8"
              >
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={addCourse}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Course
        </Button>
        <div className="flex-grow" />
        <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          Calculate GPA
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Reset All
        </Button>
      </div>
    </form>
  );
};
