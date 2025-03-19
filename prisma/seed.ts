// seed.ts

import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Seed user
  const password = await hash("test", 12);
  const user = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: { password, active: true }, // Make sure user is active
    create: {
      email: "test@test.com",
      name: "Test User",
      password,
      active: true,
    },
  });
  console.log("Seeded user:", user);

  // Create Python journey
  const pythonJourney = await prisma.journey.upsert({
    where: { slug: 'python' },
    update: {},
    create: {
      title: 'Python Journey',
      description: 'Learn Python from basics to advanced concepts',
      slug: 'python',
      icon: 'python',
      difficultyLevel: 'Beginner',
      isActive: true,
      order: 1,
    },
  });
  console.log(`Created/updated Python journey with ID: ${pythonJourney.id}`);

    // Create HTML journey
    const htmlJourney = await prisma.journey.upsert({
      where: { slug: 'html' },
      update: {},
      create: {
        title: 'HTML Journey',
        description: 'Learn HTML fundamentals and web page structure',
        slug: 'html',
        icon: 'html',
        difficultyLevel: 'Beginner',
        isActive: true,
        order: 2,
      },
    });
    console.log(`Created/updated HTML journey with ID: ${htmlJourney.id}`);
  
    // Create Java journey
    const javaJourney = await prisma.journey.upsert({
      where: { slug: 'java' },
      update: {},
      create: {
        title: 'Java Journey',
        description: 'Learn Java programming from basics to OOP concepts',
        slug: 'java',
        icon: 'java',
        difficultyLevel: 'Intermediate',
        isActive: true,
        order: 3,
      },
    });
    console.log(`Created/updated Java journey with ID: ${javaJourney.id}`);

  // Create levels for Python journey with enhanced test cases
  const pythonLevels = [
    {
      title: 'Hello Python',
      description: 'Your first Python program',
      difficulty: 'Beginner',
      defaultCode: 'print("Hello Python!")',
      expectedOutput: 'Hello Python!',
      solutionCode: 'print("Hello Python!")',
      hints: JSON.stringify([
        'Use the print() function to display text',
        'Python strings can be enclosed in double quotes'
      ]),
      testCases: JSON.stringify([
        {
          type: "output",
          input: "",
          expectedOutput_regex: "hello python!",
          description: "Your program should print 'Hello Python!'"
        },
        {
          type: "ast_check",
          requirement: "must_use_print",
          nodeType: "Call",
          message: "You need to use the print() function",
          description: "Your solution must use the print() function"
        }
      ]),
      order: 1,
      enableAiAnalysis: true, // Enable AI analysis for the first level
    },
    {
      title: 'Variables',
      description: 'Learn to store and use data with variables',
      difficulty: 'Beginner',
      defaultCode: '# Create a variable called name and assign your name to it\nname = ""\n\n# Print a greeting using this variable\nprint("Hello, ")',
      expectedOutput: 'Hello, Your Name!',
      solutionCode: 'name = "Your Name"\nprint("Hello, " + name + "!")',
      hints: JSON.stringify([
        'Variables store data for later use',
        'Use the assignment operator (=) to create variables',
        'You can concatenate strings using the + operator'
      ]),
      testCases: JSON.stringify([
        {
          type: "output",
          input: "",
          expectedOutput_regex: "Hello, .+!",
          description: "Your greeting should include some name"
        },
        {
          type: "ast_check",
          requirement: "variable_assignment",
          nodeType: "Assign",
          target: "name",
          description: "You must create a variable named 'name'"
        },
        {
          type: "code_pattern",
          pattern: "name",
          description: "Your code must include the variable 'name'"
        },
        {
          type: "custom_validator",
          validatorName: "check_name_in_output",
          description: "Your output should include the name variable's value"
        }
      ]),
      order: 2,
    },
    {
      title: 'Basic Math',
      description: 'Use Python to perform mathematical operations',
      difficulty: 'Beginner',
      defaultCode: '# Create variables for two numbers\na = 10\nb = 5\n\n# Print their sum\n\n# Print their difference\n\n# Print their product\n\n# Print their quotient',
      expectedOutput: 'Sum: 15\nDifference: 5\nProduct: 50\nQuotient: 2.0',
      solutionCode: 'a = 10\nb = 5\nprint("Sum:", a + b)\nprint("Difference:", a - b)\nprint("Product:", a * b)\nprint("Quotient:", a / b)',
      hints: JSON.stringify([
        'Use + for addition',
        'Use - for subtraction',
        'Use * for multiplication',
        'Use / for division'
      ]),
      testCases: JSON.stringify([
        {
          type: "output",
          input: "",
          expectedOutput: "Sum: 15\nDifference: 5\nProduct: 50\nQuotient: 2.0",
          description: "Your program should calculate and print all four operations correctly"
        },
        {
          type: "output_contains",
          text: ["Sum:", "Difference:", "Product:", "Quotient:"],
          description: "Include labels for each operation"
        },
        {
          type: "ast_check",
          requirement: "operator_usage",
          operators: ["+", "-", "*", "/"],
          description: "Your solution should use all four arithmetic operators"
        },
        {
          type: "code_pattern",
          pattern: ["a", "b", "print"],
          description: "Use the provided variables a and b"
        },
        {
          type: "custom_validator",
          validatorName: "check_calculations",
          description: "Check that calculations are correct regardless of variable values"
        }
      ]),
      order: 3,
    },
    // Additional more complex level example
    {
      title: 'Loops and Lists',
      description: 'Learn to work with lists and for loops',
      difficulty: 'Beginner',
      defaultCode: '# Create a list of numbers from 1 to 5\nnumbers = [1, 2, 3, 4, 5]\n\n# Use a for loop to calculate and print the square of each number',
      expectedOutput: '1\n4\n9\n16\n25',
      solutionCode: 'numbers = [1, 2, 3, 4, 5]\nfor num in numbers:\n    print(num ** 2)',
      hints: JSON.stringify([
        'Use a for loop to iterate through each item in the list',
        'The square of a number is the number multiplied by itself',
        'You can use the ** operator for exponentiation (num ** 2)'
      ]),
      testCases: JSON.stringify([
        {
          type: "output",
          input: "",
          expectedOutput: "1\n4\n9\n16\n25",
          description: "Your program should print the square of each number"
        },
        {
          type: "ast_check",
          requirement: "must_use_for_loop",
          nodeType: "For",
          description: "Your solution must use a for loop"
        },
        {
          type: "ast_check",
          requirement: "must_use_power_operation",
          nodeType: "BinOp",
          description: "Your solution should use the exponentiation operator (**) or multiplication"
        },
        {
          type: "code_pattern",
          pattern: ["numbers", "for", "print"],
          description: "Use the provided list and a for loop to print results"
        },
        {
          type: "custom_validator",
          validatorName: "check_loop_variable_usage",
          description: "Check that the loop variable is properly used in calculations"
        },
        {
          type: "custom_validator",
          validatorName: "check_alternate_input",
          altInputList: [1, 3, 5, 7, 9],
          expectedOutput: "1\n9\n25\n49\n81",
          description: "Solution should work with different input lists"
        }
      ]),
      order: 4,
    },
  ];

// HTML Levels
const htmlLevels = [
  {
    title: 'Hello HTML',
    description: 'Create your first HTML page with basic elements',
    difficulty: 'Beginner',
    defaultCode: '<!-- Create an HTML document with a title, heading, and paragraph -->\n<!DOCTYPE html>\n<html>\n  <head>\n    <title></title>\n  </head>\n  <body>\n    <!-- Add an h1 heading here -->\n    \n    <!-- Add a paragraph here -->\n    \n  </body>\n</html>',
    expectedOutput: '<html><head><title>My First Page</title></head><body><h1>Hello HTML!</h1><p>This is my first HTML page.</p></body></html>',
    solutionCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello HTML!</h1>\n    <p>This is my first HTML page.</p>\n  </body>\n</html>',
    hints: JSON.stringify([
      'HTML documents need a DOCTYPE declaration',
      'The <title> element defines what appears in the browser tab',
      'Use <h1> for main headings',
      'Use <p> for paragraphs'
    ]),
    testCases: JSON.stringify([
      {
        type: "dom_check",
        selector: "h1",
        exists: true,
        description: "Page must include an h1 heading"
      },
      {
        type: "dom_check",
        selector: "p",
        exists: true,
        description: "Page must include a paragraph"
      },
      {
        type: "dom_check",
        selector: "title",
        exists: true,
        description: "Page must have a title"
      },
      {
        type: "dom_content",
        selector: "h1",
        contains: "Hello HTML",
        caseSensitive: false,
        description: "Heading should say 'Hello HTML'"
      },
      {
        type: "html_validation",
        description: "HTML document should be valid"
      }
    ]),
    order: 1,
    enableAiAnalysis: true,
    xpReward: 100,
  },
  {
    title: 'Links and Images',
    description: 'Learn to add hyperlinks and images to your web pages',
    difficulty: 'Beginner',
    defaultCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Links and Images</title>\n  </head>\n  <body>\n    <h1>Web Resources</h1>\n    \n    <!-- Add a paragraph with a link to MDN Web Docs -->\n    \n    <!-- Add an image with appropriate alt text -->\n    \n  </body>\n</html>',
    expectedOutput: '<html><head><title>Links and Images</title></head><body><h1>Web Resources</h1><p>Learn more at <a href="https://developer.mozilla.org">MDN Web Docs</a>.</p><img src="image.jpg" alt="Web development" width="300"></body></html>',
    solutionCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Links and Images</title>\n  </head>\n  <body>\n    <h1>Web Resources</h1>\n    <p>Learn more at <a href="https://developer.mozilla.org">MDN Web Docs</a>.</p>\n    <img src="image.jpg" alt="Web development" width="300">\n  </body>\n</html>',
    hints: JSON.stringify([
      'Use <a href="URL">text</a> for hyperlinks',
      'The href attribute specifies the link destination',
      'Use <img src="URL" alt="description"> for images',
      'The alt attribute provides text for screen readers'
    ]),
    testCases: JSON.stringify([
      {
        type: "dom_check",
        selector: "a",
        exists: true,
        description: "Page must include a hyperlink"
      },
      {
        type: "dom_check",
        selector: "img",
        exists: true,
        description: "Page must include an image"
      },
      {
        type: "attribute_check",
        selector: "a",
        attribute: "href",
        exists: true,
        description: "Link must have an href attribute"
      },
      {
        type: "attribute_check",
        selector: "img",
        attribute: "alt",
        exists: true,
        description: "Image must have an alt attribute"
      },
      {
        type: "attribute_check",
        selector: "img",
        attribute: "width",
        exists: true,
        description: "Image should have a width attribute"
      },
      {
        type: "dom_relationship",
        parent: "p",
        child: "a",
        description: "Link should be inside a paragraph"
      }
    ]),
    order: 2,
    xpReward: 100,
  },
  {
    title: 'Lists and Tables',
    description: 'Create structured content with HTML lists and tables',
    difficulty: 'Beginner',
    defaultCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Lists and Tables</title>\n  </head>\n  <body>\n    <h1>Structured Content</h1>\n    \n    <!-- Create an unordered list with 3 items -->\n    \n    <!-- Create a table with 2 rows and 3 columns including headers -->\n    \n  </body>\n</html>',
    expectedOutput: '<html><head><title>Lists and Tables</title></head><body><h1>Structured Content</h1><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul><table><tr><th>Name</th><th>Age</th><th>Country</th></tr><tr><td>John</td><td>25</td><td>USA</td></tr></table></body></html>',
    solutionCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Lists and Tables</title>\n  </head>\n  <body>\n    <h1>Structured Content</h1>\n    \n    <ul>\n      <li>Item 1</li>\n      <li>Item 2</li>\n      <li>Item 3</li>\n    </ul>\n    \n    <table>\n      <tr>\n        <th>Name</th>\n        <th>Age</th>\n        <th>Country</th>\n      </tr>\n      <tr>\n        <td>John</td>\n        <td>25</td>\n        <td>USA</td>\n      </tr>\n    </table>\n  </body>\n</html>',
    hints: JSON.stringify([
      'Use <ul> for unordered lists and <li> for list items',
      'Tables start with <table> and contain rows <tr>',
      'Use <th> for table headers and <td> for table data cells',
      'Each row should have the same number of cells'
    ]),
    testCases: JSON.stringify([
      {
        type: "dom_check",
        selector: "ul",
        exists: true,
        description: "Page must include an unordered list"
      },
      {
        type: "dom_check",
        selector: "li",
        count: 3,
        description: "List should have exactly 3 items"
      },
      {
        type: "dom_check",
        selector: "table",
        exists: true,
        description: "Page must include a table"
      },
      {
        type: "dom_check",
        selector: "th",
        count: 3,
        description: "Table should have 3 header cells"
      },
      {
        type: "dom_check",
        selector: "tr",
        count: 2,
        description: "Table should have exactly 2 rows"
      },
      {
        type: "dom_relationship",
        parent: "tr",
        child: "td",
        description: "Table data cells should be inside rows"
      },
      {
        type: "dom_structure",
        selector: "tr",
        childrenCount: 3,
        description: "Each row should have 3 cells"
      }
    ]),
    order: 3,
    xpReward: 150,
  },
  {
    title: 'Forms and Input',
    description: 'Build an interactive form with various input elements',
    difficulty: 'Intermediate',
    defaultCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Contact Form</title>\n  </head>\n  <body>\n    <h1>Contact Us</h1>\n    \n    <!-- Create a form with name, email, and message fields -->\n    <!-- Include a submit button -->\n    \n  </body>\n</html>',
    expectedOutput: '<html><head><title>Contact Form</title></head><body><h1>Contact Us</h1><form action="/submit" method="post"><label for="name">Name:</label><input type="text" id="name" name="name" required><label for="email">Email:</label><input type="email" id="email" name="email" required><label for="message">Message:</label><textarea id="message" name="message" rows="4" required></textarea><button type="submit">Send Message</button></form></body></html>',
    solutionCode: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Contact Form</title>\n  </head>\n  <body>\n    <h1>Contact Us</h1>\n    \n    <form action="/submit" method="post">\n      <label for="name">Name:</label>\n      <input type="text" id="name" name="name" required>\n      \n      <label for="email">Email:</label>\n      <input type="email" id="email" name="email" required>\n      \n      <label for="message">Message:</label>\n      <textarea id="message" name="message" rows="4" required></textarea>\n      \n      <button type="submit">Send Message</button>\n    </form>\n  </body>\n</html>',
    hints: JSON.stringify([
      'Use <form> element with action and method attributes',
      'Each input should have a corresponding <label>',
      'Use different input types like text, email',
      'The textarea element is for multi-line text input',
      'Add the required attribute for required fields'
    ]),
    testCases: JSON.stringify([
      {
        type: "dom_check",
        selector: "form",
        exists: true,
        description: "Page must include a form"
      },
      {
        type: "attribute_check",
        selector: "form",
        attribute: "action",
        exists: true,
        description: "Form must have an action attribute"
      },
      {
        type: "attribute_check",
        selector: "form",
        attribute: "method",
        value: "post",
        description: "Form should use POST method"
      },
      {
        type: "dom_check",
        selector: "input[type='text']",
        exists: true,
        description: "Form must include a text input"
      },
      {
        type: "dom_check",
        selector: "input[type='email']",
        exists: true,
        description: "Form must include an email input"
      },
      {
        type: "dom_check",
        selector: "textarea",
        exists: true,
        description: "Form must include a textarea"
      },
      {
        type: "dom_check",
        selector: "button[type='submit']",
        exists: true,
        description: "Form must include a submit button"
      },
      {
        type: "attribute_check",
        selector: "input, textarea",
        attribute: "required",
        description: "Form fields should be required"
      },
      {
        type: "dom_check",
        selector: "label",
        count: 3,
        description: "Form should have labels for each field"
      },
      {
        type: "accessibility_check",
        requirement: "label_for_inputs",
        description: "Each input must have an associated label with for attribute"
      }
    ]),
    order: 4,
    xpReward: 200,
  }
];

// Java Levels
const javaLevels = [
  {
    title: 'Hello Java',
    description: 'Write your first Java program',
    difficulty: 'Beginner',
    defaultCode: '// Create a class called HelloJava with a main method\n// Print "Hello, Java!" to the console\n',
    expectedOutput: 'Hello, Java!',
    solutionCode: 'public class HelloJava {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}',
    hints: JSON.stringify([
      'Java programs need a class definition',
      'The main method is the entry point for execution',
      'Use System.out.println() to display text',
      'Java is case-sensitive, so make sure capitalization is correct'
    ]),
    testCases: JSON.stringify([
      {
        type: "output",
        input: "",
        expectedOutput: "Hello, Java!",
        description: "Your program should print 'Hello, Java!'"
      },
      {
        type: "compile_check",
        description: "Code must compile without errors"
      },
      {
        type: "ast_check",
        requirement: "class_definition",
        className: "HelloJava",
        description: "Define a class named HelloJava"
      },
      {
        type: "ast_check",
        requirement: "method_definition",
        methodName: "main",
        isStatic: true,
        returnType: "void",
        description: "Class must have a static void main method"
      },
      {
        type: "code_pattern",
        pattern: "System.out.println",
        description: "Use System.out.println to print to console"
      }
    ]),
    order: 1,
    enableAiAnalysis: true,
    xpReward: 100,
  },
  {
    title: 'Variables and Data Types',
    description: 'Learn to use variables and basic data types in Java',
    difficulty: 'Beginner',
    defaultCode: 'public class VariablesExample {\n    public static void main(String[] args) {\n        // Declare and initialize an integer variable\n        \n        // Declare and initialize a double variable\n        \n        // Declare and initialize a String variable\n        \n        // Print all variables with appropriate labels\n        \n    }\n}',
    expectedOutput: 'Integer value: 42\nDouble value: 3.14\nString value: Hello, Java!',
    solutionCode: 'public class VariablesExample {\n    public static void main(String[] args) {\n        // Declare and initialize an integer variable\n        int num = 42;\n        \n        // Declare and initialize a double variable\n        double pi = 3.14;\n        \n        // Declare and initialize a String variable\n        String message = "Hello, Java!";\n        \n        // Print all variables with appropriate labels\n        System.out.println("Integer value: " + num);\n        System.out.println("Double value: " + pi);\n        System.out.println("String value: " + message);\n    }\n}',
    hints: JSON.stringify([
      'Use int for integer values',
      'Use double for decimal numbers',
      'Use String for text values (remember the quotes)',
      'You can concatenate strings with the + operator',
      'Each variable must be declared with its type'
    ]),
    testCases: JSON.stringify([
      {
        type: "output",
        input: "",
        expectedOutput_regex: "Integer value: \\d+\\nDouble value: \\d+\\.\\d+\\nString value: .+",
        description: "Output should show all three variables with labels"
      },
      {
        type: "compile_check",
        description: "Code must compile without errors"
      },
      {
        type: "ast_check",
        requirement: "variable_declaration",
        variableType: "int",
        description: "Declare an integer variable"
      },
      {
        type: "ast_check",
        requirement: "variable_declaration",
        variableType: "double",
        description: "Declare a double variable"
      },
      {
        type: "ast_check",
        requirement: "variable_declaration",
        variableType: "String",
        description: "Declare a String variable"
      },
      {
        type: "code_pattern",
        pattern: ["System.out.println", "Integer value", "Double value", "String value"],
        description: "Print each variable with an appropriate label"
      },
      {
        type: "custom_validator",
        validatorName: "check_variable_usage",
        description: "Verify that all declared variables are used in output"
      }
    ]),
    order: 2,
    xpReward: 100,
  },
  {
    title: 'Conditional Statements',
    description: 'Learn to use if, else if, and else statements in Java',
    difficulty: 'Beginner',
    defaultCode: 'public class GradeChecker {\n    public static void main(String[] args) {\n        int score = 85;\n        \n        // Determine the grade based on the score:\n        // 90-100: A\n        // 80-89: B\n        // 70-79: C\n        // 60-69: D\n        // Below 60: F\n        \n        // Print the score and corresponding grade\n        \n    }\n}',
    expectedOutput: 'Score: 85\nGrade: B',
    solutionCode: 'public class GradeChecker {\n    public static void main(String[] args) {\n        int score = 85;\n        String grade;\n        \n        if (score >= 90) {\n            grade = "A";\n        } else if (score >= 80) {\n            grade = "B";\n        } else if (score >= 70) {\n            grade = "C";\n        } else if (score >= 60) {\n            grade = "D";\n        } else {\n            grade = "F";\n        }\n        \n        System.out.println("Score: " + score);\n        System.out.println("Grade: " + grade);\n    }\n}',
    hints: JSON.stringify([
      'Use if, else if, and else for multiple conditions',
      'Start with the highest range and work downward',
      'Store the grade in a variable for easier printing',
      'Use >= for "greater than or equal to" comparisons',
      'Remember to print both the score and the grade'
    ]),
    testCases: JSON.stringify([
      {
        type: "output",
        input: "",
        expectedOutput: "Score: 85\nGrade: B",
        description: "For score of 85, output should show grade B"
      },
      {
        type: "compile_check",
        description: "Code must compile without errors"
      },
      {
        type: "ast_check",
        requirement: "conditional_structure",
        structure: "if_else",
        count: 1,
        description: "Code should use conditional statements"
      },
      {
        type: "code_pattern",
        pattern: ["if", "else"],
        description: "Use if and else statements"
      },
      {
        type: "custom_validator",
        validatorName: "check_score_variations",
        testValues: [95, 85, 75, 65, 55],
        expectedGrades: ["A", "B", "C", "D", "F"],
        description: "Solution should work for any score value"
      },
      {
        type: "output_contains",
        text: ["Score:", "Grade:"],
        description: "Output should include labels for score and grade"
      }
    ]),
    order: 3,
    xpReward: 150,
  },
  {
    title: 'Loops and Arrays',
    description: 'Work with arrays and loops in Java',
    difficulty: 'Intermediate',
    defaultCode: 'public class ArrayProcessor {\n    public static void main(String[] args) {\n        // Create an integer array with values 5, 10, 15, 20, 25\n        \n        // Use a loop to calculate the sum of all elements\n        \n        // Use a loop to find the maximum value\n        \n        // Print the sum and maximum value\n        \n    }\n}',
    expectedOutput: 'Array: [5, 10, 15, 20, 25]\nSum: 75\nMaximum value: 25',
    solutionCode: 'public class ArrayProcessor {\n    public static void main(String[] args) {\n        // Create an integer array with values 5, 10, 15, 20, 25\n        int[] numbers = {5, 10, 15, 20, 25};\n        \n        // Use a loop to calculate the sum of all elements\n        int sum = 0;\n        for (int i = 0; i < numbers.length; i++) {\n            sum += numbers[i];\n        }\n        \n        // Use a loop to find the maximum value\n        int max = numbers[0];\n        for (int num : numbers) {\n            if (num > max) {\n                max = num;\n            }\n        }\n        \n        // Print the array, sum, and maximum value\n        System.out.print("Array: [");\n        for (int i = 0; i < numbers.length; i++) {\n            System.out.print(numbers[i]);\n            if (i < numbers.length - 1) {\n                System.out.print(", ");\n            }\n        }\n        System.out.println("]");\n        System.out.println("Sum: " + sum);\n        System.out.println("Maximum value: " + max);\n    }\n}',
    hints: JSON.stringify([
      'Declare an array with int[] name = {value1, value2, ...}',
      'Use a for loop to iterate through array elements',
      'To access array elements, use arrayName[index]',
      'Arrays are zero-indexed in Java',
      'You can use the enhanced for loop (for-each) for simpler iteration',
      'Initialize max with the first element of the array'
    ]),
    testCases: JSON.stringify([
      {
        type: "output",
        input: "",
        expectedOutput_regex: "Array: \\[5, 10, 15, 20, 25\\]\\nSum: 75\\nMaximum value: 25",
        description: "Output should show the array, sum (75), and maximum value (25)"
      },
      {
        type: "compile_check",
        description: "Code must compile without errors"
      },
      {
        type: "ast_check",
        requirement: "array_declaration",
        arrayType: "int",
        description: "Declare an integer array"
      },
      {
        type: "ast_check",
        requirement: "loop_structure",
        count: 2,
        description: "Code should use at least two loops"
      },
      {
        type: "code_pattern",
        pattern: ["for", "if", "numbers.length"],
        description: "Use loops and conditionals to process the array"
      },
      {
        type: "custom_validator",
        validatorName: "check_array_processing",
        testArray: [8, 2, 16, 4, 12],
        expectedSum: 42,
        expectedMax: 16,
        description: "Solution should work with any array of integers"
      },
      {
        type: "output_contains",
        text: ["Array:", "Sum:", "Maximum value:"],
        description: "Output should include labels for the array, sum, and maximum"
      }
    ]),
    order: 4,
    xpReward: 200,
  }
];

  // Add each level to the database
  for (const levelData of pythonLevels) {
    const level = await prisma.level.upsert({
      where: {
        journeyId_order: {
          journeyId: pythonJourney.id,
          order: levelData.order,
        },
      },
      update: levelData,
      create: {
        ...levelData,
        journeyId: pythonJourney.id,
        xpReward: 100, // Default XP reward
      },
    });
    console.log(`Created/updated level: ${level.title} (ID: ${level.id})`);
  }

    // Add HTML levels to the database
    for (const levelData of htmlLevels) {
      const level = await prisma.level.upsert({
        where: {
          journeyId_order: {
            journeyId: htmlJourney.id,
            order: levelData.order,
          },
        },
        update: levelData,
        create: {
          ...levelData,
          journeyId: htmlJourney.id,
        },
      });
      console.log(`Created/updated HTML level: ${level.title} (ID: ${level.id})`);
    }
  
    // Add Java levels to the database
    for (const levelData of javaLevels) {
      const level = await prisma.level.upsert({
        where: {
          journeyId_order: {
            journeyId: javaJourney.id,
            order: levelData.order,
          },
        },
        update: levelData,
        create: {
          ...levelData,
          journeyId: javaJourney.id,
        },
      });
      console.log(`Created/updated Java level: ${level.title} (ID: ${level.id})`);
    }


// Add these to your main function in seed.ts after the Java levels section

// Create challenge types
const codeGolfType = await prisma.challengeType.upsert({
  where: { type: "code_golf" },
  update: {
    description: "Write the shortest possible code that solves the problem. The solution with the fewest characters wins."
  },
  create: {
    type: "code_golf",
    description: "Write the shortest possible code that solves the problem. The solution with the fewest characters wins."
  }
});
console.log(`Created/updated challenge type: ${codeGolfType.type}`);

// Create time trial challenge type
const timeTrialType = await prisma.challengeType.upsert({
  where: { type: "time_trial" },
  update: {
    description: "Optimize your code for speed. The solution with the fastest execution time wins."
  },
  create: {
    type: "time_trial",
    description: "Optimize your code for speed. The solution with the fastest execution time wins."
  }
});
console.log(`Created/updated challenge type: ${timeTrialType.type}`);

// Create memory optimization challenge type
const memoryOptType = await prisma.challengeType.upsert({
  where: { type: "memory_optimization" },
  update: {
    description: "Optimize your code for minimal memory usage. The solution using the least memory wins."
  },
  create: {
    type: "memory_optimization",
    description: "Optimize your code for minimal memory usage. The solution using the least memory wins."
  }
});
console.log(`Created/updated challenge type: ${memoryOptType.type}`);

// Python challenges
const pythonChallenges = [
  // Code Golf Challenge
  {
    id: "challenge-palindrome",
    title: "String Palindrome Checker",
    description: "Create a function that checks if a given string is a palindrome (reads the same forwards and backwards). Ignore spaces, punctuation, and capitalization.",
    difficulty: "Beginner",
    starterCode: "def is_palindrome(s):\n    # Your code here\n    pass\n\n# Test cases\nprint(is_palindrome('racecar'))  # True\nprint(is_palindrome('hello'))    # False\nprint(is_palindrome('A man, a plan, a canal, Panama'))  # True",
    initialCode: "def is_palindrome(s):\n    # Your code here\n    pass",
    sampleInput: "racecar",
    expectedOutput: "True",
    solutionCode: "def is_palindrome(s):\n    s = ''.join(c.lower() for c in s if c.isalnum())\n    return s == s[::-1]",
    languageId: 28,  // Python
    timeLimit: 1000,
    memoryLimit: 256,
    isActive: true,
    challengeTypes: {
      connect: { id: codeGolfType.id }
    }
  },
  
  // Time Trial Challenge
  {
    id: "challenge-primes",
    title: "Prime Number Generator",
    description: "Create a function that generates all prime numbers up to a given limit n using the Sieve of Eratosthenes algorithm. Optimize your solution for the fastest execution time.",
    difficulty: "Intermediate",
    starterCode: "def generate_primes(n):\n    # Your code here\n    pass\n\n# Test cases\nprint(generate_primes(20))  # [2, 3, 5, 7, 11, 13, 17, 19]\nprint(len(generate_primes(1000)))  # 168 primes below 1000",
    initialCode: "def generate_primes(n):\n    # Your code here\n    pass",
    sampleInput: "20",
    expectedOutput: "[2, 3, 5, 7, 11, 13, 17, 19]",
    solutionCode: "def generate_primes(n):\n    if n < 2:\n        return []\n    sieve = [True] * (n + 1)\n    sieve[0] = sieve[1] = False\n    for i in range(2, int(n**0.5) + 1):\n        if sieve[i]:\n            for j in range(i*i, n + 1, i):\n                sieve[j] = False\n    return [i for i in range(n + 1) if sieve[i]]",
    languageId: 28,  // Python
    timeLimit: 1000,
    memoryLimit: 256,
    isActive: true,
    challengeTypes: {
      connect: { id: timeTrialType.id }
    }
  },
  
  // Memory Optimization Challenge
  {
    id: "challenge-fibonacci",
    title: "Fibonacci Sequence",
    description: "Implement a function to calculate the nth Fibonacci number. The Fibonacci sequence starts with 0 and 1, and each subsequent number is the sum of the two preceding ones (0, 1, 1, 2, 3, 5, 8, ...). Optimize your solution for minimal memory usage.",
    difficulty: "Intermediate",
    starterCode: "def fibonacci(n):\n    # Your code here\n    pass\n\n# Test cases\nprint(fibonacci(10))  # 55\nprint(fibonacci(20))  # 6765\nprint(fibonacci(30))  # 832040",
    initialCode: "def fibonacci(n):\n    # Your code here\n    pass",
    sampleInput: "10",
    expectedOutput: "55",
    solutionCode: "def fibonacci(n):\n    if n <= 0:\n        return 0\n    if n == 1:\n        return 1\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b",
    languageId: 28,  // Python
    timeLimit: 1000,
    memoryLimit: 256,
    isActive: true,
    challengeTypes: {
      connect: { id: memoryOptType.id }
    }
  }
];

// Add Python challenges to the database
for (const challengeData of pythonChallenges) {
  const challenge = await prisma.challenge.upsert({
    where: { id: challengeData.id },
    update: challengeData,
    create: challengeData
  });
  console.log(`Created/updated challenge: ${challenge.title} (ID: ${challenge.id})`);
  
  // Add challenge test cases
  if (challenge.id === "challenge-palindrome") {
    // First delete any existing test cases to avoid conflicts
    await prisma.challengeTestCase.deleteMany({
      where: { challengeId: challenge.id }
    });
    
    // Create new test cases
    await prisma.challengeTestCase.create({
      data: {
        challengeId: challenge.id,
        input: "racecar",
        expectedOutput: "True",
        isHidden: false
      }
    });
    
    await prisma.challengeTestCase.create({
      data: {
        challengeId: challenge.id,
        input: "hello",
        expectedOutput: "False",
        isHidden: false
      }
    });
  }
  
  else if (challenge.id === "challenge-primes") {
    // First delete any existing test cases to avoid conflicts
    await prisma.challengeTestCase.deleteMany({
      where: { challengeId: challenge.id }
    });
    
    // Create new test cases
    await prisma.challengeTestCase.create({
      data: {
        challengeId: challenge.id,
        input: "20",
        expectedOutput: "[2, 3, 5, 7, 11, 13, 17, 19]",
        isHidden: false
      }
    });
  }
  
  else if (challenge.id === "challenge-fibonacci") {
    // First delete any existing test cases to avoid conflicts
    await prisma.challengeTestCase.deleteMany({
      where: { challengeId: challenge.id }
    });
    
    // Create new test cases
    await prisma.challengeTestCase.create({
      data: {
        challengeId: challenge.id,
        input: "10",
        expectedOutput: "55",
        isHidden: false
      }
    });
  }
}

}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });