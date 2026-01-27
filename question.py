'''
ROUND 3 Question Bank


1. An algorithm performs the following operations on an array of size n:
•	A loop runs n times
•	Inside the loop, a binary search is performed on a sorted array
What is the overall time complexity?
A) O(n)
B) O(n log n)
C) O(log n)
D) O(n²)
✅ Answer: B

2. An algorithm runs a loop n times.
Inside the loop, another loop runs i times for the current value of i (starting from 1).
What is the overall time complexity?
A) O(n)
B) O(n log n)
C) O(n²)
D) O(n³)
✅ Answer: C

3. Which of the following algorithms has different best-case and worst-case time complexities?
A) Merge Sort
B) Binary Search
C) Heap Sort
D) Selection Sort
✅ Answer: B
4.You are given an unsorted array of n distinct elements.
Which algorithm will take exactly the same number of comparisons, regardless of input order?
A) Bubble Sort
B) Insertion Sort
C) Selection Sort
D) Quick Sort
✅ Answer: C
5.A recursive function calls itself once for every element in an array of size n and does constant work each time.
What is the time complexity?
A) O(log n)
B) O(n)
C) O(n log n)
D) O(n²)
✅ Answer: B

7. You need to find the second largest element in an unsorted array using the minimum number of comparisons.
Which approach is best?
A) Sort the array
B) Traverse the array twice
C) Use a tournament method
D) Use Binary Search
✅ Answer: C

8. You need to sort an array where:
•	Input size is small
•	Nearly all elements are already sorted
Which algorithm is most efficient?
A) Quick Sort
B) Merge Sort
C) Insertion Sort
D) Heap Sort
✅ Answer: C

8. A stack is initially empty.
Elements 1, 2, 3, 4 are pushed in this order.
Which of the following output sequences is NOT possible?
A) 3 1 4 2
B) 2 4 3 1
C) 4 3 2 1
D) 3 2 4 1
✅ Answer: A

9. In a binary tree:
•	Inorder: D B E A F C G
•	Preorder: A B D E C F G
What is the left child of C?
A) F
B) G
C) E
D) D
✅ Answer: A

10. Given the expression:
((A + (B * C)) - ((D / E) + F))
What is the maximum stack depth required during evaluation?
A) 3
B) 4
C) 5
D) 6
✅ Answer: C

11. Input: 1 2 3 4
Rules:
•	Elements move from input → Stack S1 → Stack S2 → Output
•	You cannot move directly from input to S2
•	You may pop from either stack at any time
Which sequence is IMPOSSIBLE?
A) 2 1 4 3
B) 3 2 1 4
C) 4 3 2 1
D) 3 1 4 2
✅ Answer: D

12. Stack and Queue start empty.
Operations:
1.	Push 1, 2, 3, 4, 5 into stack
2.	Pop three elements → enqueue
3.	Push 6, 7 into stack
4.	Dequeue one element
5.	Pop remaining stack elements → enqueue
Final queue order?
A) 5 4 3 7 6 2 1
B) 5 4 3 6 7 2 1
C) 3 4 5 7 6 2 1
D) 5 4 6 7 3 2 1
✅ Answer: A

13. Circular queue size = 10
Initial:
•	front = 7
•	rear = 6
•	Queue is not empty and not full
Operations:
1.	ENQUEUE ×3
2.	DEQUEUE ×4
3.	ENQUEUE ×2
How many elements remain?
A) 5
B) 6
C) 7
D) 8
✅ Answer: B

14. A singly linked list contains:
10 → 20 → 30 → 40 → 50 → NULL
Operations:
1.	Delete the second node
2.	Insert 25 after node containing 30
3.	Delete the last node
What is the final list?
A) 10 → 30 → 25 → 40
B) 10 → 30 → 25 → 40 → 50
C) 10 → 20 → 30 → 25 → 40
D) 10 → 25 → 30 → 40

15. A Binary Search Tree (BST) contains the keys: 15, 10, 20, 8, 12, 17, 25.
If you delete the node 10, what is the inorder traversal of the new BST?
A) 8, 12, 15, 17, 20, 25
B) 8, 15, 12, 17, 20, 25
C) 8, 12, 15, 20, 17, 25
D) 12, 8, 15, 17, 20, 25
✅ Answer: A

16. If A → B and B → C are functional dependencies, which is always TRUE?
A) C → A
B) A → C
C) B → A
D) C → B
✅ Answer: B

17. Which statement is TRUE?
A) A primary key can contain NULL values
B) A table can have more than one candidate key
C) A foreign key must reference a primary key only
D) Candidate keys can have duplicate values
✅ Answer: B


18. A relation is in 3NF but not in BCNF.
Which of the following MUST be true?
A) It contains partial dependency
B) It contains transitive dependency
C) There exists a non-key determinant
D) It has multivalued dependency
✅ Answer: C

19. Which ACID property ensures that partial changes are never saved if a transaction fails?
A) Atomicity
B) Consistency
C) Isolation
D) Durability
✅ Answer: A

20. What happens if a referenced primary key value is deleted without cascade rules?
A) The delete always succeeds
B) Related foreign key values are set to NULL
C) The delete is rejected
D) The table is automatically dropped
✅ Answer: C

21. Which of the following is a weak entity?
A) An entity with a composite key
B) An entity dependent on another entity for identification
C) An entity with multiple attributes
D) An entity without relationships
✅ Answer: B

22. Table Users:
Name
Alice
Alina
Bob
Query:
SELECT * FROM Users WHERE Name LIKE 'Al%';
Output?
A) Alice
B) Alina
C) Alice, Alina
D) Bob
✅ Answer: C

23. Transaction T1: UPDATE Account SET Balance=Balance-100 WHERE ID=1
Transaction T2: SELECT Balance FROM Account WHERE ID=1 (simultaneous)
Which anomaly can occur if isolation level = READ UNCOMMITTED?
A) Dirty Read
B) Lost Update
C) Phantom Read
D) None
✅ Answer: A

24. Table Products:
ID	Name	Price
1	Pen	10
2	Book	50
Query:
UPDATE Products SET Price = Price + 10 WHERE Name='Pen';
New price of Book?
A) 10
B) 50
C) 60
D) 20
✅ Answer: B

25. How many times is "Hello" printed?
for(int i = 1; i <= 3; i++){
    for(int j = i; j <= 3; j++){
        print("Hello");
    }
}
A) 3
B) 4
C) 5
D) 6
✅ Answer: D

26. What is the output?
int x = 5;
if(true){
    int x = 10;
}
print(x);
A) 5
B) 10
C) Compile-time error
D) Runtime error
✅ Answer: C

27. What is the value of x?
int x = 5;
x = x++ + ++x;
A) 10
B) 11
C) 12
D) Undefined behavior
✅ Answer: D

28. int x = 2, y = 1;
for(int i = 1; i <= 4; i++){
    y = y + x;
    x = x + i;
}
print(x + y);
A) 16
B) 18
C) 20
D) 22

✅ Answer: C

29. int sum = 0;
for(int i = 1; i <= 5; i++){
    int x = i;
    while(x > 0){
        sum += x;
        x = x - 2;
    }
}
print(sum);
A) 15
B) 20
C) 25
D) 30

✅ Answer: C

30. int x = 0, i = 1;
while(i <= 10){
    if(i % 4 == 0)
        x += i;
    else if(i % 3 == 0)
        x -= i;
    i++;
}
print(x);
A) 2
B) 4
C) 6
D) 8

✅ Answer: B

31. Which of the following necessarily occurs during a context switch?
A) CPU cache is cleared
B) Process state is saved
C) Process code is modified
D) Hard disk access is required
✅ Answer: B

32. A system allows preemption of resources.
Which deadlock condition is definitely eliminated?
A) Mutual exclusion
B) Hold and wait
C) No preemption
D) Circular wait
✅ Answer: C

33. Which statement is CORRECT?
A) Paging eliminates internal fragmentation
B) Segmentation eliminates external fragmentation
C) Paging divides memory into fixed-size blocks
D) Segmentation uses physical memory addresses only
✅ Answer: C

34. Why are user programs not allowed to execute privileged instructions?
A) To improve execution speed
B) To reduce memory consumption
C) To ensure system security and stability
D) To avoid compilation errors
✅ Answer: C

35. A program P is stored on disk.
It is loaded into memory and execution begins.
Later, execution is paused and resumed.
Which statement is TRUE?
A) P is a program throughout
B) P becomes a process only when paused
C) P is a process during execution and pause
D) P becomes a process only when resumed
✅ Answer: C

36. During a context switch, which of the following MUST be saved to resume execution correctly?
A) Source code of the process
B) Process registers and program counter
C) Entire main memory
D) Hard disk data
✅ Answer: B

37. A system removes the hold and wait condition.
What is the strongest conclusion?
A) Deadlock is still possible
B) Deadlock is impossible
C) Starvation is impossible
D) Circular wait is guaranteed
✅ Answer: B

38. A process is:
•	Loaded into memory
•	Given CPU time
•	Requests I/O
•	Later resumes execution
Which sequence of states is MOST accurate?
A) New → Ready → Running → Ready → Running
B) New → Ready → Running → Waiting → Ready → Running
C) New → Running → Waiting → Terminated
D) Ready → Running → Waiting → Running
✅ Answer: B

39. Increasing cache size indefinitely will eventually:
A) Always improve performance
B) Increase average memory access time
C) Show diminishing performance gains
D) Eliminate need for RAM

40. If interrupts are disabled for too long, the MOST serious issue is:
A) Reduced CPU speed
B) Increased memory usage
C) Delayed I/O handling
D) Faster execution
✅ Answer: C

41. A program updates a database record and then crashes before commit.
Which component ensures the database remains correct?
A) Compiler
B) Operating System
C) Transaction Manager
D) Stack Memory
✅ Answer: C
'''
