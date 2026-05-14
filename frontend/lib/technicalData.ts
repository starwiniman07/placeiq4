/**
 * Static Technical Prep Data (Full Subject Coverage)
 */

export const STATIC_MCQS: Record<string, any[]> = {
  DSA: [
    { id: "dsa_1", question: "LIFO data structure?", options: { A: "Queue", B: "Stack", C: "Heap", D: "Graph" }, correct: "B", explanation: "Stacks use Last In First Out.", topic: "Stack", difficulty: "Easy" },
    { id: "dsa_2", question: "Binary Search Complexity?", options: { A: "O(n)", B: "O(log n)", C: "O(1)", D: "O(n²)" }, correct: "B", explanation: "Divide and conquer search.", topic: "Searching", difficulty: "Easy" }
  ],
  DBMS: [
    { id: "dbms_1", question: "Remove all rows (DDL)?", options: { A: "DELETE", B: "TRUNCATE", C: "DROP", D: "ALTER" }, correct: "B", explanation: "TRUNCATE is DDL, DELETE is DML.", topic: "SQL", difficulty: "Medium" },
    { id: "dbms_2", question: "ACID 'I' stands for?", options: { A: "Internal", B: "Isolation", C: "Indexing", D: "Integration" }, correct: "B", explanation: "Isolation ensures concurrent transactions don't interfere.", topic: "Core", difficulty: "Easy" }
  ],
  OOPS: [
    { id: "oops_1", question: "Ability to take many forms?", options: { A: "Inheritance", B: "Polymorphism", C: "Abstraction", D: "Encapsulation" }, correct: "B", explanation: "Polymorphism.", topic: "Basics", difficulty: "Easy" },
    { id: "oops_2", question: "Hiding internal details?", options: { A: "Inheritance", B: "Abstraction", C: "Polymorphism", D: "Overloading" }, correct: "B", explanation: "Abstraction hides implementation complexity.", topic: "Basics", difficulty: "Easy" }
  ],
  OS: [
    { id: "os_1", question: "Wait-for condition?", options: { A: "Deadlock", B: "Paging", C: "Interrupt", D: "Swapping" }, correct: "A", explanation: "Deadlock happens when processes wait for each other.", topic: "Deadlock", difficulty: "Medium" },
    { id: "os_2", question: "LRU is a type of?", options: { A: "Process Scheduling", B: "Page Replacement", C: "Disk Scheduling", D: "File Allocation" }, correct: "B", explanation: "Least Recently Used is for paging.", topic: "Memory", difficulty: "Medium" }
  ],
  CN: [
    { id: "cn_1", question: "IP Address layer?", options: { A: "Link", B: "Network", C: "Transport", D: "Session" }, correct: "B", explanation: "Network layer handles IP.", topic: "OSI", difficulty: "Easy" },
    { id: "cn_2", question: "HTTP Port?", options: { A: "443", B: "80", C: "21", D: "25" }, correct: "B", explanation: "HTTP uses port 80.", topic: "Protocols", difficulty: "Easy" }
  ],
  Java: [
    { id: "j_1", question: "Size of int?", options: { A: "2 bytes", B: "4 bytes", C: "8 bytes", D: "Depends" }, correct: "B", explanation: "Java int is 32-bit (4 bytes).", topic: "Basics", difficulty: "Easy" },
    { id: "j_2", question: "Final keyword use?", options: { A: "Define variable", B: "Prevent inheritance/modification", C: "Exit loop", D: "Create class" }, correct: "B", explanation: "Final prevents further modification.", topic: "Core", difficulty: "Medium" }
  ],
  Python: [
    { id: "py_1", question: "Mutable type?", options: { A: "Tuple", B: "List", C: "String", D: "Int" }, correct: "B", explanation: "Lists can be changed in place.", topic: "Basics", difficulty: "Easy" },
    { id: "py_2", question: "Lambda in Python?", options: { A: "Loop", B: "Anonymous Function", C: "Class", D: "Module" }, correct: "B", explanation: "Lambda is for short anonymous functions.", topic: "Advanced", difficulty: "Medium" }
  ],
  WebDev: [
    { id: "w_1", question: "Hook for side effects?", options: { A: "useState", B: "useEffect", C: "useRef", D: "useMemo" }, correct: "B", explanation: "useEffect handles lifecycle/side effects.", topic: "React", difficulty: "Medium" },
    { id: "w_2", question: "Z-index requires?", options: { A: "Color", B: "Position", C: "Display: flex", D: "Width" }, correct: "B", explanation: "Z-index works on positioned elements.", topic: "CSS", difficulty: "Medium" }
  ]
};

export const STATIC_PROBLEMS: Record<string, any> = {
  DSA: {
    title: "Binary Search",
    difficulty: "Medium",
    topic: "Algorithms",
    problemStatement: "Implement Binary Search on a sorted array of integers.",
    inputFormat: "Sorted array and target value.",
    outputFormat: "Index of target or -1.",
    constraints: ["O(log n) complexity"],
    examples: [{ input: "arr=[1,2,3,4,5], target=3", output: "2" }],
    hints: ["Divide the array in half"],
    starterCode: { python: "def search(arr, target):\n    # implement binary search\n    return -1" },
    testCases: [{ input: "[1, 2, 3], 2", expectedOutput: "1" }]
  },
  DBMS: {
    title: "SQL Query: Employees",
    difficulty: "Easy",
    topic: "SQL",
    problemStatement: "Write a query to select all employees with salary > 50000.",
    inputFormat: "Table Employees(id, name, salary)",
    outputFormat: "Result set",
    constraints: ["Basic SELECT"],
    examples: [{ input: "salary values", output: "filtered employees" }],
    hints: ["Use WHERE clause"],
    starterCode: { javascript: "// Write SQL as a string\nconst query = \"SELECT * FROM Employees WHERE salary > 50000\";" },
    testCases: []
  },
  OOPS: {
    title: "Class Inheritance",
    difficulty: "Easy",
    topic: "Core",
    problemStatement: "Create a class Animal and a child class Dog that inherits from it.",
    inputFormat: "Class definitions",
    outputFormat: "Inherited methods",
    constraints: ["Use extends"],
    examples: [{ input: "Dog extends Animal", output: "Success" }],
    hints: ["Use the super keyword if needed"],
    starterCode: { javascript: "class Animal {}\nclass Dog extends Animal {}" },
    testCases: []
  },
  OS: {
    title: "FIFO Page Replacement",
    difficulty: "Medium",
    topic: "Paging",
    problemStatement: "Calculate the number of page faults using FIFO for a given page reference string.",
    inputFormat: "Reference string and frame size.",
    outputFormat: "Number of faults.",
    constraints: ["Basic queue logic"],
    examples: [{ input: "[7,0,1,2], frames=3", output: "4" }],
    hints: ["Use a queue to track pages in frames"],
    starterCode: { python: "def fifo(pages, frames):\n    pass" },
    testCases: []
  },
  CN: {
    title: "IP Address Validator",
    difficulty: "Medium",
    topic: "Networking",
    problemStatement: "Write a function to check if a string is a valid IPv4 address.",
    inputFormat: "String like '192.168.1.1'",
    outputFormat: "True/False",
    constraints: ["4 octets, 0-255 each"],
    examples: [{ input: "256.0.0.1", output: "False" }],
    hints: ["Split by dot and check each part"],
    starterCode: { python: "def is_valid_ip(ip):\n    pass" },
    testCases: []
  },
  Java: {
    title: "Factorial Recursion",
    difficulty: "Easy",
    topic: "Recursion",
    problemStatement: "Write a recursive Java method to calculate factorial of n.",
    inputFormat: "Integer n",
    outputFormat: "n!",
    constraints: ["n >= 0"],
    examples: [{ input: "5", output: "120" }],
    hints: ["Base case: n=0 or 1"],
    starterCode: { java: "public class Solution {\n    public int fact(int n) {\n        return 0;\n    }\n}" },
    testCases: []
  },
  Python: {
    title: "List Comprehension",
    difficulty: "Easy",
    topic: "Basics",
    problemStatement: "Given a list of numbers, return a list of their squares using list comprehension.",
    inputFormat: "[1, 2, 3]",
    outputFormat: "[1, 4, 9]",
    constraints: ["One-liner preferred"],
    examples: [{ input: "[1, 2]", output: "[1, 4]" }],
    hints: ["Syntax: [expr for item in list]"],
    starterCode: { python: "def squares(arr):\n    return [x**2 for x in arr]" },
    testCases: []
  },
  WebDev: {
    title: "React Toggle Hook",
    difficulty: "Easy",
    topic: "Hooks",
    problemStatement: "Write a custom hook useToggle that returns a boolean state and a toggle function.",
    inputFormat: "Initial boolean",
    outputFormat: "[state, toggleFn]",
    constraints: ["Use useState"],
    examples: [{ input: "false", output: "toggles to true" }],
    hints: ["Return an array or object"],
    starterCode: { javascript: "const useToggle = (init) => {\n  const [s, setS] = useState(init);\n  return [s, () => setS(!s)];\n};" },
    testCases: []
  }
};

export const STATIC_VIVA: Record<string, any[]> = {
  DSA: [
    { id: "v1", question: "Array vs LinkedList?", difficulty: "Medium", topic: "Basics", companies: ["TCS"], expectedAnswer: "Arrays contiguous, O(1) access. LinkedList non-contiguous, O(1) insert.", keyPoints: ["Memory", "Access time"] }
  ],
  DBMS: [
    { id: "v2", question: "Normalization purpose?", difficulty: "Medium", topic: "Design", companies: ["Infosys"], expectedAnswer: "To reduce data redundancy and improve data integrity.", keyPoints: ["Redundancy", "Anomalies"] }
  ],
  OOPS: [
    { id: "v3", question: "Abstract vs Interface?", difficulty: "Hard", topic: "Core", companies: ["Amazon"], expectedAnswer: "Abstract classes have state/constructor. Interfaces define behavior contracts.", keyPoints: ["State", "Multiple inheritance"] }
  ],
  OS: [
    { id: "v4", question: "Process vs Thread?", difficulty: "Medium", topic: "Processes", companies: ["Microsoft"], expectedAnswer: "Process is independent program. Thread is unit of execution within process.", keyPoints: ["Memory sharing", "Overhead"] }
  ],
  CN: [
    { id: "v5", question: "TCP vs UDP?", difficulty: "Medium", topic: "Protocols", companies: ["Cisco"], expectedAnswer: "TCP is reliable, connection-oriented. UDP is fast, connectionless.", keyPoints: ["Handshake", "Reliability"] }
  ],
  Java: [
    { id: "v6", question: "What is JVM?", difficulty: "Easy", topic: "Runtime", companies: ["Oracle"], expectedAnswer: "Java Virtual Machine enables the computer to run Java programs.", keyPoints: ["Bytecode", "Platform independence"] }
  ],
  Python: [
    { id: "v7", question: "Explain GIL.", difficulty: "Hard", topic: "Advanced", companies: ["Google"], expectedAnswer: "Global Interpreter Lock prevents multiple threads from executing Python bytecodes at once.", keyPoints: ["Thread safety", "Multi-core limit"] }
  ],
  WebDev: [
    { id: "v8", question: "Virtual DOM?", difficulty: "Medium", topic: "React", companies: ["Meta"], expectedAnswer: "Lightweight representation of the real DOM used for reconciliation.", keyPoints: ["Performance", "Diffing algorithm"] }
  ]
};
