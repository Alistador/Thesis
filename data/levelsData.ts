  // data/levelsData.ts
  import { LevelData } from "../types/levelTypes";
  
  export const levelsData: LevelData[] = [
    {
      id: 1,
      title: "Hello Python",
      description: "Welcome to Python! This is your first program. Just run the code to see what happens.",
      difficulty: "Beginner",
      defaultCode: 'print("Hello Python!")',
      expectedOutput: "Hello Python!",
      hints: ["Use the print function to display text on the screen."],
      solutionCode: 'print("Hello Python!")',
      languageId: 28 // Python 3.10
    },
    {
      id: 2,
      title: "Variables",
      description: "Variables are containers for storing data values. Create a variable named 'name' and assign your name to it. Then print a greeting using that variable.",
      difficulty: "Beginner",
      defaultCode: '# Create a variable named "name" and assign your name to it\nname = ""\n\n# Print a greeting using that variable\nprint("Hello, ")',
      expectedOutput: "Hello, Your Name!",
      testCases: [
        {
          input: "",
          expectedOutput: "Hello, ",
          description: "Your program should print a greeting with a name."
        }
      ],
      hints: [
        "Use the assignment operator (=) to set a value to a variable.",
        "You can concatenate strings using the + operator."
      ],
      solutionCode: 'name = "Your Name"\nprint("Hello, " + name + "!")',
      languageId: 28
    },
    {
      id: 3,
      title: "Operators",
      description: "Python provides various operators for mathematical operations. Write a program that calculates and prints the sum, difference, product, and quotient of two numbers.",
      difficulty: "Beginner",
      defaultCode: '# Define two variables a and b with numeric values\na = 10\nb = 5\n\n# Calculate and print the sum\n\n# Calculate and print the difference\n\n# Calculate and print the product\n\n# Calculate and print the quotient',
      expectedOutput: "Sum: 15\nDifference: 5\nProduct: 50\nQuotient: 2.0",
      hints: [
        "Use the + operator for addition",
        "Use the - operator for subtraction",
        "Use the * operator for multiplication",
        "Use the / operator for division"
      ],
      solutionCode: 'a = 10\nb = 5\nprint("Sum:", a + b)\nprint("Difference:", a - b)\nprint("Product:", a * b)\nprint("Quotient:", a / b)',
      languageId: 28
    },
    // Add more levels as needed
  ];
  
  // Function to get level data by ID
  export function getLevelById(id: number): LevelData | undefined {
    return levelsData.find(level => level.id === id);
  }