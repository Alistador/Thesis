// utils/pythonAstParser.ts
import { submitCode } from '@/utils/judge0Service';

export interface AstRequirement {
  requirement: string;
  [key: string]: any;
}

export interface AstAnalysisResult {
  valid: boolean;
  requirements?: Record<string, { passed: boolean; message: string }>;
  error?: string;
  node_counts?: Record<string, number>;
}

// Main function to analyze Python code AST
export async function analyzeAst(code: string, requirements: AstRequirement[]): Promise<AstAnalysisResult> {
  // Create a Python script that analyzes the code
  const analysisScript = `
import ast
import json
import sys

# The code to be analyzed (escaped to avoid syntax issues)
student_code = '''${code.replace(/'/g, "\\'")}'''

# Initialize result structure
result = {
    "valid": True,
    "requirements": {},
    "error": None
}

# Function to count node types
def count_node_types(node):
    counts = {}
    
    def visit(node, counts):
        node_type = type(node).__name__
        counts[node_type] = counts.get(node_type, 0) + 1
        for child in ast.iter_child_nodes(node):
            visit(child, counts)
    
    if node:
        visit(node, counts)
    return counts

# Try to parse the code
try:
    tree = ast.parse(student_code)
    
    # Get counts of all node types
    node_counts = count_node_types(tree)
    result["node_counts"] = node_counts
    
    # Check specific requirements
    ${generateRequirementChecks(requirements)}
    
except Exception as e:
    result["valid"] = False
    result["error"] = str(e)

# Print JSON result (this will be captured by Judge0)
print(json.dumps(result))
`;

  // Send the analysis script to Judge0
  const response = await submitCode(analysisScript, 28, ""); // 28 is Python language ID
  
  if (response.status?.id !== 3) {
    return { 
      valid: false, 
      error: response.stderr || response.compile_output || "Execution failed" 
    };
  }
  
  try {
    return JSON.parse(response.stdout || "{}");
  } catch (e) {
    return { 
      valid: false, 
      error: "Could not parse analysis result" 
    };
  }
}

// Helper function to generate Python code for checking requirements
function generateRequirementChecks(requirements: AstRequirement[]): string {
  return requirements.map(req => {
    switch (req.requirement) {
      case "must_use_for_loop":
        return `
# Check for for loops
result["requirements"]["must_use_for_loop"] = {
    "passed": node_counts.get("For", 0) > 0,
    "message": "Your code must use a for loop" if node_counts.get("For", 0) == 0 else "Code uses a for loop"
}`;
      
      case "must_use_while_loop":
        return `
# Check for while loops
result["requirements"]["must_use_while_loop"] = {
    "passed": node_counts.get("While", 0) > 0,
    "message": "Your code must use a while loop" if node_counts.get("While", 0) == 0 else "Code uses a while loop"
}`;

      case "must_use_function_def":
        return `
# Check for function definitions
result["requirements"]["must_use_function_def"] = {
    "passed": node_counts.get("FunctionDef", 0) > 0,
    "message": "Your code must define a function" if node_counts.get("FunctionDef", 0) == 0 else "Code defines a function"
}`;

      case "must_use_print":
        return `
# Check for print function calls
has_print = False
for node in ast.walk(tree):
    if isinstance(node, ast.Call) and hasattr(node.func, 'id') and node.func.id == "print":
        has_print = True
        break

result["requirements"]["must_use_print"] = {
    "passed": has_print,
    "message": "Your code must use the print() function" if not has_print else "Code uses the print function"
}`;

      case "variable_assignment":
        return `
# Check for specific variable assignment
has_var_assignment = False
for node in ast.walk(tree):
    if isinstance(node, ast.Assign):
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id == "${req.target}":
                has_var_assignment = True
                break

result["requirements"]["variable_assignment"] = {
    "passed": has_var_assignment,
    "message": "You must assign a value to '${req.target}'" if not has_var_assignment else "Variable '${req.target}' correctly assigned"
}`;

      case "operator_usage":
        const operators = JSON.stringify(req.operators);
        return `
# Check for specific operators
op_mapping = {"+": "Add", "-": "Sub", "*": "Mult", "/": "Div", "**": "Pow"}
required_ops = ${operators}
found_ops = []

for node in ast.walk(tree):
    if isinstance(node, ast.BinOp):
        op_type = type(node.op).__name__
        for symbol, ast_name in op_mapping.items():
            if ast_name == op_type and symbol in required_ops:
                found_ops.append(symbol)

# Remove duplicates
found_ops = list(set(found_ops))
missing_ops = [op for op in required_ops if op not in found_ops]
result["requirements"]["operator_usage"] = {
    "passed": len(missing_ops) == 0,
    "message": "You need to use these operators: " + str(missing_ops) if missing_ops else "All required operators used correctly"
}`;

      case "must_use_power_operation":
        return `
# Check for power operations (either ** or n*n pattern)
has_power_op = False
has_square_mult = False

for node in ast.walk(tree):
    if isinstance(node, ast.BinOp):
        # Check for ** operator
        if isinstance(node.op, ast.Pow):
            has_power_op = True
            break
            
        # Check for n*n pattern (multiplication of same variable)
        if isinstance(node.op, ast.Mult):
            if (isinstance(node.left, ast.Name) and 
                isinstance(node.right, ast.Name) and
                node.left.id == node.right.id):
                has_square_mult = True
                break

result["requirements"]["must_use_power_operation"] = {
    "passed": has_power_op or has_square_mult,
    "message": "Code uses the power operator (**)" if has_power_op else 
              "Code calculates square using multiplication" if has_square_mult else
              "Code should use exponentiation (**) or multiplication to calculate squares"
}`;

      case "check_loop_variable_usage":
        return `
# Check if loop variable is used in print statement
has_proper_loop_var_usage = False

for node in ast.walk(tree):
    if isinstance(node, ast.For) and node.body:
        loop_var_name = ""
        if isinstance(node.target, ast.Name):
            loop_var_name = node.target.id
        
        # Check each print statement in the loop body
        for body_node in node.body:
            if isinstance(body_node, ast.Expr) and isinstance(body_node.value, ast.Call):
                call = body_node.value
                if isinstance(call.func, ast.Name) and call.func.id == "print" and call.args:
                    # Check if any argument uses the loop variable
                    def check_arg(arg, var_name):
                        if isinstance(arg, ast.Name) and arg.id == var_name:
                            return True
                        elif isinstance(arg, ast.BinOp):
                            return check_arg(arg.left, var_name) or check_arg(arg.right, var_name)
                        return False
                    
                    for arg in call.args:
                        if check_arg(arg, loop_var_name):
                            has_proper_loop_var_usage = True
                            break

result["requirements"]["check_loop_variable_usage"] = {
    "passed": has_proper_loop_var_usage,
    "message": "Make sure you use the loop variable in your calculation" if not has_proper_loop_var_usage else "Loop variable is correctly used in the calculation"
}`;
      
      default:
        return `
# Unknown requirement: ${req.requirement}
result["requirements"]["${req.requirement}"] = {
    "passed": False,
    "message": "Unknown requirement type"
}`;
    }
  }).join('\n');
}

// Client-side AST analysis simulation for local validation
// This is used as a fallback when Judge0 is not available
export function parseLocalAst(code: string): any {
  // This is a very basic simulation - it doesn't actually parse Python code
  // It's just meant as a placeholder for the real AST structure
  const lines = code.split('\n');
  const simulatedAst: any = {
    type: 'Module',
    body: []
  };
  
  // Very simple detection of certain patterns - NOT a real parser
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('for ') && trimmedLine.includes(' in ')) {
      // Detect for loops
      const forMatch = trimmedLine.match(/for\s+(\w+)\s+in/);
      if (forMatch) {
        simulatedAst.body.push({
          type: 'For',
          target: { type: 'Name', id: forMatch[1] },
          body: []
        });
      }
    } else if (trimmedLine.startsWith('while ')) {
      // Detect while loops
      simulatedAst.body.push({
        type: 'While',
        body: []
      });
    } else if (trimmedLine.startsWith('def ')) {
      // Detect function definitions
      simulatedAst.body.push({
        type: 'FunctionDef',
        body: []
      });
    } else if (trimmedLine.startsWith('print(')) {
      // Detect print statements
      const printMatch = trimmedLine.match(/print\((.*)\)/);
      if (printMatch) {
        simulatedAst.body.push({
          type: 'Expr',
          value: {
            type: 'Call',
            func: { type: 'Name', id: 'print' },
            args: [{ type: 'Str', value: printMatch[1] }]
          }
        });
      }
    } else if (trimmedLine.includes('=') && !trimmedLine.includes('==')) {
      // Detect variable assignments
      const assignMatch = trimmedLine.match(/(\w+)\s*=/);
      if (assignMatch) {
        simulatedAst.body.push({
          type: 'Assign',
          targets: [{ type: 'Name', id: assignMatch[1] }],
          value: { type: 'Str', value: 'value' }
        });
      }
    }
  }
  
  return simulatedAst;
}