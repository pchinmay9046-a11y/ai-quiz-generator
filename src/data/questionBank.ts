import { QuizQuestion } from '../types/quiz';

export const QUESTION_BANK: QuizQuestion[] = [
  // ==================== PYTHON ====================
  {
    id: 'py-01',
    topic: 'Python',
    subcategory: 'Data Structures',
    difficulty: 'easy',
    prompt: 'What is the primary difference between a Python list and a Python tuple?',
    options: [
      'Lists are mutable, whereas tuples are immutable',
      'Tuples can only store numbers, while lists can store any object',
      'Lists are indexed from 0, while tuples are indexed from 1',
      'Tuples have higher asymptotic lookup complexity O(N) than lists O(1)'
    ],
    correctIndex: 0,
    explanation: 'In Python, lists are mutable (elements can be added, removed, or modified in place), while tuples are immutable (once defined, their elements cannot be changed). Both support zero-based indexing, arbitrary types, and O(1) index lookups.',
    source: 'bank'
  },
  {
    id: 'py-02',
    topic: 'Python',
    subcategory: 'Syntax & Functions',
    difficulty: 'easy',
    prompt: 'What will `bool([])` evaluate to in Python?',
    options: [
      'False',
      'True',
      'None',
      'TypeError'
    ],
    correctIndex: 0,
    explanation: 'In Python truth-value testing, empty collections such as lists `[]`, dictionaries `{}`, sets `set()`, strings `""`, and numbers equal to zero evaluate to `False`. Non-empty collections evaluate to `True`.',
    source: 'bank'
  },
  {
    id: 'py-03',
    topic: 'Python',
    subcategory: 'Scoping & Closures',
    difficulty: 'medium',
    prompt: 'What happens when a mutable object (like a list `[]`) is used as a default argument in a Python function definition?',
    options: [
      'A fresh list is instantiated each time the function is called without that parameter',
      'The default list is instantiated once at function definition time and shared across subsequent calls',
      'Python throws a SyntaxError at compile time',
      'The argument automatically behaves as an immutable tuple inside the function'
    ],
    correctIndex: 1,
    explanation: 'Default argument expressions in Python are evaluated once when the function definition is executed. If a mutable object like a list or dictionary is modified inside the function, the modified object persists and is reused in subsequent calls where the argument is omitted.',
    source: 'bank'
  },
  {
    id: 'py-04',
    topic: 'Python',
    subcategory: 'Generators',
    difficulty: 'medium',
    prompt: 'What is the primary operational advantage of using a generator function with `yield` instead of returning a complete list?',
    options: [
      'Generators run in separate OS threads automatically',
      'Generators produce items lazily one at a time, requiring O(1) memory instead of holding all items in RAM',
      'Generators execute at C-level CPU speed with SIMD vectorization',
      'Generators prevent any exceptions from being raised during iteration'
    ],
    correctIndex: 1,
    explanation: 'Generators yield values on demand (lazy evaluation). Instead of creating and storing the entire sequence in memory at once (O(N) memory), generators maintain state and yield one item per iteration step, achieving O(1) space complexity for large or infinite streams.',
    source: 'bank'
  },
  {
    id: 'py-05',
    topic: 'Python',
    subcategory: 'Concurrency & GIL',
    difficulty: 'hard',
    prompt: 'Why does Python\'s Global Interpreter Lock (GIL) in CPython limit CPU-bound multi-threaded performance, and what is the standard standard-library solution?',
    options: [
      'The GIL restricts I/O operations; the solution is using `asyncio` for CPU workloads',
      'The GIL prevents multiple native threads from executing Python bytecode simultaneously; the solution is the `multiprocessing` module',
      'The GIL encrypts heap memory during threading; the solution is the `threading.Lock` class',
      'The GIL forces all functions to run as single-pass generators; the solution is `cProfile`'
    ],
    correctIndex: 1,
    explanation: 'In CPython, the GIL is a mutex that ensures only one native thread executes Python bytecode at any moment, preventing multi-core speedup for CPU-bound computations. The `multiprocessing` module bypasses the GIL by spawning separate OS processes with individual memory spaces and independent Python interpreters.',
    source: 'bank'
  },
  {
    id: 'py-06',
    topic: 'Python',
    subcategory: 'Decorators & Metaprogramming',
    difficulty: 'hard',
    prompt: 'What is the purpose of `@functools.wraps(func)` when writing a custom Python function decorator?',
    options: [
      'It memoizes return values of the wrapped function to prevent duplicate computation',
      'It preserves the original function metadata such as `__name__`, `__doc__`, and signature on the wrapper',
      'It catches unhandled exceptions and prevents the program from terminating',
      'It converts the decorator into a multi-threaded daemon'
    ],
    correctIndex: 1,
    explanation: 'Without `@functools.wraps`, the decorated function takes on the name and docstring of the inner wrapper function (usually "wrapper"), confusing introspective tools, debuggers, and help text. `@functools.wraps` copies over `__name__`, `__doc__`, `__annotations__`, and other attributes.',
    source: 'bank'
  },

  // ==================== MACHINE LEARNING ====================
  {
    id: 'ml-01',
    topic: 'Machine Learning',
    subcategory: 'Supervised Learning',
    difficulty: 'easy',
    prompt: 'Which metric is most appropriate for evaluating a binary classification model on a heavily imbalanced dataset (e.g., 99% negative, 1% positive)?',
    options: [
      'Accuracy',
      'Mean Squared Error (MSE)',
      'Precision, Recall, and PR-AUC',
      'R-squared coefficient'
    ],
    correctIndex: 2,
    explanation: 'With heavy class imbalance, a trivial model that always predicts the majority class achieves 99% accuracy while finding zero true positives. Precision, Recall, F1-score, and Precision-Recall AUC specifically evaluate the model\'s ability to identify the rare positive class without being inflated by true negatives.',
    source: 'bank'
  },
  {
    id: 'ml-02',
    topic: 'Machine Learning',
    subcategory: 'Fundamentals',
    difficulty: 'easy',
    prompt: 'What is the fundamental difference between supervised learning and unsupervised learning?',
    options: [
      'Supervised learning uses labeled target outcomes during training, while unsupervised learning discovers patterns without labels',
      'Supervised learning only works on image data, while unsupervised learning works on tabular data',
      'Supervised models do not use loss functions during optimization',
      'Unsupervised learning requires manual human verification for each gradient step'
    ],
    correctIndex: 0,
    explanation: 'Supervised learning trains on pairs of inputs and corresponding target labels (e.g., regression targets or class labels). Unsupervised learning operates on unlabeled inputs to find intrinsic structures, clusters, or lower-dimensional representations (e.g., K-Means, PCA).',
    source: 'bank'
  },
  {
    id: 'ml-03',
    topic: 'Machine Learning',
    subcategory: 'Model Generalization',
    difficulty: 'medium',
    prompt: 'In the bias-variance tradeoff, what does high variance in a predictive model typically indicate?',
    options: [
      'Underfitting: the model is too simple to capture underlying relationships in the data',
      'Overfitting: the model is overly sensitive to fluctuations and noise in the training set',
      'The model has achieved the lowest possible Bayes error rate',
      'The dataset has zero collinearity among input features'
    ],
    correctIndex: 1,
    explanation: 'High variance means the model fits the training data too tightly—capturing noise, outliers, and quirks of the specific sample—resulting in poor generalization to unseen test data (overfitting). High bias, by contrast, indicates underfitting.',
    source: 'bank'
  },
  {
    id: 'ml-04',
    topic: 'Machine Learning',
    subcategory: 'Regularization',
    difficulty: 'medium',
    prompt: 'How does L1 regularization (Lasso) differ mathematically and practically from L2 regularization (Ridge)?',
    options: [
      'L1 penalizes squared weights; L2 penalizes absolute weights and induces sparsity',
      'L1 penalizes the sum of absolute weight values and drives non-essential weights to zero (sparsity), while L2 penalizes squared values and shrinks weights toward zero without setting them to zero',
      'L1 can only be applied to neural networks, while L2 is reserved exclusively for linear regression',
      'L1 increases model complexity, while L2 decreases training speed by half'
    ],
    correctIndex: 1,
    explanation: 'L1 regularization adds the term λ∑|w_i| to the loss, whose geometric sharp corners frequently intersect axis intercepts, setting coefficients exactly to zero (acting as feature selection). L2 regularization adds λ∑w_i², smoothly shrinking weights toward zero without forcing exact sparsity.',
    source: 'bank'
  },
  {
    id: 'ml-05',
    topic: 'Machine Learning',
    subcategory: 'Optimization',
    difficulty: 'hard',
    prompt: 'Why is the Adam (Adaptive Moment Estimation) optimizer widely favored over standard Stochastic Gradient Descent (SGD) for deep learning models?',
    options: [
      'Adam completely eliminates the need for computing gradients through backpropagation',
      'Adam computes individual adaptive learning rates for each parameter using estimates of both first (mean) and second (uncentered variance) gradient moments',
      'Adam guarantees convergence to the global minimum on non-convex surfaces within 10 epochs',
      'Adam uses second-order Hessian matrices directly for Newton-Raphson optimization'
    ],
    correctIndex: 1,
    explanation: 'Adam combines the ideas of Momentum (first moment: moving average of gradients) and RMSprop (second moment: moving average of squared gradients) with bias corrections. This adapts step sizes for sparse vs. dense features, stabilizing learning on complex loss landscapes without manual per-parameter tuning.',
    source: 'bank'
  },
  {
    id: 'ml-06',
    topic: 'Machine Learning',
    subcategory: 'Ensemble Methods',
    difficulty: 'hard',
    prompt: 'How does the training process of Gradient Boosting (e.g., XGBoost, LightGBM) fundamentally differ from Random Forests?',
    options: [
      'Random Forests train trees sequentially on prior errors; Gradient Boosting trains trees independently in parallel',
      'Gradient Boosting trains trees sequentially where each new tree fits the pseudo-residuals of the existing ensemble; Random Forests train deep trees in parallel via bagging',
      'Random Forests require continuous target variables only, whereas Gradient Boosting cannot perform regression',
      'Gradient Boosting does not use decision trees as base learners'
    ],
    correctIndex: 1,
    explanation: 'Random Forest is a bagging (bootstrap aggregating) technique where independent deep trees are trained in parallel to reduce variance. Gradient Boosting is a sequential boosting technique where each shallow tree is trained to predict the negative gradient (residuals) of the loss function evaluated at the current ensemble predictions.',
    source: 'bank'
  },

  // ==================== GENERATIVE AI ====================
  {
    id: 'genai-01',
    topic: 'Generative AI',
    subcategory: 'LLM Foundations',
    difficulty: 'easy',
    prompt: 'In modern large language models, what is a "token"?',
    options: [
      'A secure OAuth 2.0 access credential required for API authentication',
      'A chunk of text (a sub-word, word, or character) converted into a numerical ID that the neural network processes',
      'A single parameter or weight in a transformer feed-forward layer',
      'An encrypted database key representing a user session'
    ],
    correctIndex: 1,
    explanation: 'In LLMs, tokenization splits text into discrete chunks called tokens (using algorithms like Byte-Pair Encoding or WordPiece). Common words might be a single token, while rare words are split into sub-word tokens. The model maps these token IDs to continuous vector embeddings.',
    source: 'bank'
  },
  {
    id: 'genai-02',
    topic: 'Generative AI',
    subcategory: 'Sampling & Decoding',
    difficulty: 'easy',
    prompt: 'What effect does increasing the "temperature" parameter have during text generation with an LLM?',
    options: [
      'It increases randomness and creative diversity by flattening the probability distribution over candidate tokens',
      'It strictly speeds up inference latency by skipping attention matrix multiplications',
      'It forces the model to choose only the single highest probability token at every step',
      'It expands the context window size of the model'
    ],
    correctIndex: 0,
    explanation: 'Temperature divides the model logits before the softmax function. As temperature increases (e.g., 0.8–1.2), the softmax distribution becomes flatter, making less probable tokens more likely to be sampled (higher variety/creativity). At temperature 0 (greedy decoding), the model always picks the top token.',
    source: 'bank'
  },
  {
    id: 'genai-03',
    topic: 'Generative AI',
    subcategory: 'Transformer Architecture',
    difficulty: 'medium',
    prompt: 'What is the primary computational bottleneck of standard Scaled Dot-Product Self-Attention with respect to input sequence length N?',
    options: [
      'O(N) linear time and O(1) constant memory',
      'O(N²) quadratic time and memory complexity for the attention score matrix',
      'O(2^N) exponential time complexity due to combinatorial decoding',
      'O(log N) logarithmic operations bound by token dictionary size'
    ],
    correctIndex: 1,
    explanation: 'In standard self-attention (Attention(Q, K, V) = softmax(QK^T / √d_k)V), multiplying the query matrix Q (N x d) by the key matrix K^T (d x N) creates an N x N matrix of attention scores. This yields O(N²) quadratic scaling in both computation and memory with sequence length.',
    source: 'bank'
  },
  {
    id: 'genai-04',
    topic: 'Generative AI',
    subcategory: 'RAG & Retrieval',
    difficulty: 'medium',
    prompt: 'What is the primary role of Retrieval-Augmented Generation (RAG) in an AI application?',
    options: [
      'To retrain all weights of a base model on proprietary data each time a query arrives',
      'To fetch relevant external knowledge from a vector store or search index and inject it into the prompt context to ground the model\'s response',
      'To compress image tokens into audio frequency representations',
      'To replace neural networks with symbolic rule engines'
    ],
    correctIndex: 1,
    explanation: 'RAG decouples parametric knowledge (weights frozen during pre-training) from non-parametric external knowledge. At inference time, user queries are matched against document chunks via semantic embeddings, and the top relevant passages are supplied in the prompt context to reduce hallucinations and ground answers.',
    source: 'bank'
  },
  {
    id: 'genai-05',
    topic: 'Generative AI',
    subcategory: 'Fine-Tuning',
    difficulty: 'hard',
    prompt: 'How does Low-Rank Adaptation (LoRA) enable parameter-efficient fine-tuning (PEFT) of large models?',
    options: [
      'By quantizing all float32 weights down to 1-bit binary representations',
      'By freezing pre-trained model weights and decomposing weight updates ΔW into two low-rank matrices A and B such that ΔW = B · A',
      'By pruning 95% of transformer attention heads completely from memory',
      'By retraining only the final softmax classification layer while deleting hidden layers'
    ],
    correctIndex: 1,
    explanation: 'LoRA assumes that the weight updates during task adaptation have a low "intrinsic dimension". It freezes the base weight matrix W_0 (d x k) and injects trainable rank-decomposition matrices B (d x r) and A (r x k), where rank r << min(d, k). This reduces trainable parameter counts by 99%+ with negligible quality loss.',
    source: 'bank'
  },
  {
    id: 'genai-06',
    topic: 'Generative AI',
    subcategory: 'Alignment & RLHF',
    difficulty: 'hard',
    prompt: 'In Direct Preference Optimization (DPO), what is the key innovation compared to traditional RLHF (PPO)?',
    options: [
      'DPO eliminates the need for any human feedback data',
      'DPO analytically reparameterizes the reward function in terms of the optimal policy, optimizing preference data directly with cross-entropy without training an explicit reward model or using reinforcement learning',
      'DPO uses Monte Carlo tree search on every generated word during user interactions',
      'DPO trains an adversary discriminator model using generative adversarial loss'
    ],
    correctIndex: 1,
    explanation: 'Standard RLHF requires training a separate reward model, followed by complex, unstable PPO reinforcement learning loops. DPO mathematically demonstrates that the reward model can be expressed implicitly via the log-ratio of the policy to the reference model, enabling direct supervised preference loss on paired (chosen, rejected) completions.',
    source: 'bank'
  },

  // ==================== JAVASCRIPT & WEB ====================
  {
    id: 'js-01',
    topic: 'JavaScript',
    subcategory: 'Core Types',
    difficulty: 'easy',
    prompt: 'What will `typeof null` evaluate to in JavaScript, and why?',
    options: [
      '"null", because it is an explicit null primitive',
      '"object", which is a historical legacy bug in JavaScript\'s initial type tagging system',
      '"undefined", because null values have not been initialized',
      '"boolean", because null evaluates to false in boolean contexts'
    ],
    correctIndex: 1,
    explanation: 'In the original implementation of JavaScript, values were stored with a type tag in the lower bits of the binary representation. The type tag for objects was 000. Because null was represented as the NULL pointer (0x00), its type tag was read as 000 ("object"). This legacy quirk is retained for backward compatibility.',
    source: 'bank'
  },
  {
    id: 'js-02',
    topic: 'JavaScript',
    subcategory: 'Event Loop',
    difficulty: 'medium',
    prompt: 'In what order will the following execute: a synchronous `console.log`, a `setTimeout(..., 0)`, and a `Promise.resolve().then(...)`?',
    options: [
      'Synchronous code -> setTimeout (macrotask) -> Promise (microtask)',
      'Synchronous code -> Promise (microtask) -> setTimeout (macrotask)',
      'Promise (microtask) -> setTimeout (macrotask) -> Synchronous code',
      'setTimeout (macrotask) -> Synchronous code -> Promise (microtask)'
    ],
    correctIndex: 1,
    explanation: 'JavaScript runs synchronous code to completion on the call stack. When the stack clears, the microtask queue (Promises, MutationObservers, queueMicrotask) is processed until completely drained. Only then does the event loop take the next macrotask (such as timer callbacks from `setTimeout`).',
    source: 'bank'
  },
  {
    id: 'js-03',
    topic: 'JavaScript',
    subcategory: 'Closures & Scope',
    difficulty: 'medium',
    prompt: 'What constitutes a closure in JavaScript?',
    options: [
      'A method that immediately deletes its lexical scope once returned to free RAM',
      'The combination of a function bundled together with references to its surrounding lexical state (lexical environment)',
      'A syntax feature that prohibits functions from accessing global variables',
      'An encrypted hash wrapper around asynchronous callbacks'
    ],
    correctIndex: 1,
    explanation: 'A closure gives an inner function access to its outer enclosing scope even after the outer function has finished executing. In JavaScript, closures are created every time a function is created, at function creation time.',
    source: 'bank'
  },
  {
    id: 'js-04',
    topic: 'JavaScript',
    subcategory: 'Prototypes & Inheritance',
    difficulty: 'hard',
    prompt: 'When property lookup occurs on a JavaScript object (e.g. `obj.foo`), when does traversal of the prototype chain terminate?',
    options: [
      'When reaching `window` or `globalThis`',
      'When the property is found, or when reaching an object whose internal `[[Prototype]]` is `null` (typically `Object.prototype.__proto__`)',
      'After checking exactly three prototype layers',
      'When encountering any symbol-keyed property'
    ],
    correctIndex: 1,
    explanation: 'JavaScript searches the object\'s own properties first. If not found, it traverses up the chain to `obj.__proto__` (its internal `[[Prototype]]`). This continues until either the property is found, or the end of the chain is reached: `Object.prototype.__proto__`, which is `null`. At that point, `undefined` is returned.',
    source: 'bank'
  },

  // ==================== DATA SCIENCE ====================
  {
    id: 'ds-01',
    topic: 'Data Science',
    subcategory: 'Pandas & Tabular Data',
    difficulty: 'easy',
    prompt: 'In Python\'s Pandas library, which function is used to handle missing (`NaN`) values by filling them with a specific replacement value (such as the column mean)?',
    options: [
      '`df.dropna()`',
      '`df.fillna()`',
      '`df.replace_null()`',
      '`df.impute_mean()`'
    ],
    correctIndex: 1,
    explanation: '`df.fillna(value)` fills missing/NA values using the specified method or constant. In contrast, `df.dropna()` removes rows or columns containing missing values entirely.',
    source: 'bank'
  },
  {
    id: 'ds-02',
    topic: 'Data Science',
    subcategory: 'Statistics',
    difficulty: 'medium',
    prompt: 'According to the Central Limit Theorem (CLT), what happens to the sampling distribution of the sample mean as the sample size increases?',
    options: [
      'It adopts the exact shape of the underlying population distribution regardless of size',
      'It approximates a normal distribution, regardless of the population\'s original distribution (provided finite variance)',
      'Its variance increases proportionally with the square root of the sample size',
      'It collapses into a uniform discrete probability distribution'
    ],
    correctIndex: 1,
    explanation: 'The Central Limit Theorem states that if you take sufficiently large random samples from any population with a finite mean and variance, the distribution of the sample means will be approximately normally distributed, with mean equal to population mean and standard error σ/√n.',
    source: 'bank'
  },
  {
    id: 'ds-03',
    topic: 'Data Science',
    subcategory: 'Correlation & Metrics',
    difficulty: 'hard',
    prompt: 'Under what specific condition can Pearson\'s correlation coefficient r = 0 between two variables X and Y, even when there is an exact deterministic relationship between them?',
    options: [
      'When both variables are continuous and normally distributed',
      'When the relationship between X and Y is strictly non-linear (e.g., Y = X² where X is symmetrically distributed around 0)',
      'When the dataset sample size exceeds 1,000,000 records',
      'When the variables have identical standard deviations'
    ],
    correctIndex: 1,
    explanation: 'Pearson\'s r measures the strength and direction of linear relationships only. If Y = X² and X is uniformly distributed on [-1, 1], there is a perfect deterministic dependency, but the linear correlation coefficient evaluates to zero. Spearman or distance correlation can detect non-linear dependencies.',
    source: 'bank'
  },

  // ==================== GENERAL KNOWLEDGE & COMPUTER SCIENCE ====================
  {
    id: 'cs-01',
    topic: 'General Knowledge',
    subcategory: 'Algorithms & Data Structures',
    difficulty: 'easy',
    prompt: 'What is the average-case time complexity of retrieving a value by key from a standard Hash Table?',
    options: [
      'O(N)',
      'O(log N)',
      'O(1)',
      'O(N log N)'
    ],
    correctIndex: 2,
    explanation: 'In a well-designed hash table with a good hash function and low load factor, keys are mapped directly to array indices, yielding average O(1) constant time lookup, insertion, and deletion.',
    source: 'bank'
  },
  {
    id: 'cs-02',
    topic: 'General Knowledge',
    subcategory: 'Networking',
    difficulty: 'medium',
    prompt: 'What is the primary difference between TCP (Transmission Control Protocol) and UDP (User Datagram Protocol)?',
    options: [
      'TCP is connectionless and does not guarantee packet delivery; UDP is connection-oriented and reliable',
      'TCP is connection-oriented, guarantees packet ordering and delivery via ACKs, while UDP is connectionless and prioritizes low latency without delivery guarantees',
      'TCP only runs over optical fiber, whereas UDP operates only on Wi-Fi networks',
      'UDP encrypts all packet payloads natively with TLS 1.3 by default'
    ],
    correctIndex: 1,
    explanation: 'TCP establishes a three-way handshake, ensures packets arrive in sequential order, retransmits lost packets, and manages congestion. UDP sends datagrams without establishing a handshake or verifying receipt, making UDP preferred for real-time video, audio streaming, and gaming.',
    source: 'bank'
  },
  {
    id: 'cs-03',
    topic: 'General Knowledge',
    subcategory: 'Databases & ACID',
    difficulty: 'hard',
    prompt: 'In relational database transactions, what does the "I" (Isolation) in ACID guarantee?',
    options: [
      'Transactions are executed on an isolated air-gapped physical server',
      'Concurrent execution of transactions leaves the database in the same state that would have been obtained if transactions were executed sequentially',
      'Data is immediately backed up to isolated cold storage tape drives',
      'Only one user can log into the database management system at a time'
    ],
    correctIndex: 1,
    explanation: 'Isolation ensures that intermediate states of concurrent transactions are invisible to each other. Various isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) protect against phenomena like dirty reads, non-repeatable reads, and phantom reads.',
    source: 'bank'
  }
];

export const TOPIC_SUGGESTIONS = [
  { topic: 'Python', subcategories: ['Data Structures', 'Syntax & Functions', 'Generators & Iterators', 'Concurrency & GIL', 'Decorators'] },
  { topic: 'Machine Learning', subcategories: ['Supervised Learning', 'Model Generalization', 'Regularization', 'Optimization', 'Ensemble Methods'] },
  { topic: 'Generative AI', subcategories: ['LLM Foundations', 'Sampling & Temperature', 'Transformer Attention', 'RAG & Vector Stores', 'Fine-Tuning (LoRA)'] },
  { topic: 'JavaScript', subcategories: ['Core Types', 'Event Loop & Microtasks', 'Closures & Scope', 'Prototypes & Inheritance', 'Async / Await'] },
  { topic: 'Data Science', subcategories: ['Pandas & DataFrames', 'Statistics & CLT', 'Correlation & Causation', 'Feature Engineering'] },
  { topic: 'General Knowledge', subcategories: ['Algorithms & Big-O', 'Networking (TCP/UDP)', 'Databases & ACID', 'Operating Systems'] }
];
