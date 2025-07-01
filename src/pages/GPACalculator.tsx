
import { Calculator } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { GPACalculatorForm } from "@/components/gpa/GPACalculatorForm";
import { GPAResults } from "@/components/gpa/GPAResults";
import { useState, useEffect } from "react";
import { Course, GradeClassification } from "@/types/gpa";
import { toast } from "sonner";

const GPACalculator = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, courseCode: "", creditLoad: 0, grade: "A" }
  ]);
  const [calculatedGPA, setCalculatedGPA] = useState<number | null>(null);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [classification, setClassification] = useState<GradeClassification | null>(null);

  // Load saved courses from localStorage on component mount
  useEffect(() => {
    const savedCourses = localStorage.getItem('gpa-courses');
    if (savedCourses) {
      try {
        const parsed = JSON.parse(savedCourses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCourses(parsed);
        }
      } catch (error) {
        console.error('Error loading saved courses:', error);
      }
    }
  }, []);

  // Save courses to localStorage whenever courses change
  useEffect(() => {
    localStorage.setItem('gpa-courses', JSON.stringify(courses));
  }, [courses]);

  const getClassification = (gpa: number): GradeClassification => {
    if (gpa >= 4.5) return "First Class";
    if (gpa >= 3.5) return "Second Class Upper";
    if (gpa >= 2.5) return "Second Class Lower";
    if (gpa >= 1.5) return "Third Class";
    return "Pass";
  };

  const calculateGPA = () => {
    const validCourses = courses.filter(
      course => course.courseCode.trim() !== "" && course.creditLoad > 0
    );

    if (validCourses.length === 0) {
      toast.error("Please add at least one valid course");
      return;
    }

    let totalCreditLoad = 0;
    let totalGradePoints = 0;

    validCourses.forEach(course => {
      const gradePoint = getGradePoint(course.grade);
      const coursePoints = course.creditLoad * gradePoint;
      totalCreditLoad += course.creditLoad;
      totalGradePoints += coursePoints;
    });

    const gpa = totalGradePoints / totalCreditLoad;
    setCalculatedGPA(parseFloat(gpa.toFixed(2)));
    setTotalCredits(totalCreditLoad);
    setTotalPoints(totalGradePoints);
    setClassification(getClassification(gpa));
    
    toast.success(`GPA calculated: ${gpa.toFixed(2)} (${getClassification(gpa)})`);
  };

  const resetCalculator = () => {
    setCourses([{ id: 1, courseCode: "", creditLoad: 0, grade: "A" }]);
    setCalculatedGPA(null);
    setTotalCredits(0);
    setTotalPoints(0);
    setClassification(null);
    localStorage.removeItem('gpa-courses');
    toast.success("Calculator reset successfully");
  };

  const getGradePoint = (grade: string): number => {
    const gradeMap: { [key: string]: number } = {
      "A": 5,
      "B": 4,
      "C": 3,
      "D": 2,
      "E": 1,
      "F": 0
    };
    return gradeMap[grade] || 0;
  };

  return (
    <PageLayout
      title="G.P. Calculator"
      subtitle="Calculate your semester GPA with enhanced features and insights"
      icon={<Calculator className="h-6 w-6" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold dark:text-white">Course Details</h2>
            </div>
            <GPACalculatorForm
              courses={courses}
              setCourses={setCourses}
              onCalculate={calculateGPA}
              onReset={resetCalculator}
            />
          </div>
        </div>
        
        <div>
          <GPAResults
            calculatedGPA={calculatedGPA}
            totalCredits={totalCredits}
            totalPoints={totalPoints}
            classification={classification}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default GPACalculator;
