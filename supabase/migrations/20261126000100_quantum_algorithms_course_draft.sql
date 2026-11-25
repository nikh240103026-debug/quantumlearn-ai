-- ============================================================================
-- DRAFT course: Quantum Algorithms (8 lessons).
--
-- Everything is inserted UNPUBLISHED. Have an expert check the lessons, then
-- publish them in Admin → Lessons and the course in Admin → Courses.
-- Running this again changes nothing that already exists.
-- ============================================================================

insert into public.courses (title, slug, description, level, is_published)
select 'Quantum Algorithms', 'quantum-algorithms-course',
       'How the main quantum algorithms work, from oracles to Shor and variational methods.',
       'Intermediate', false
where not exists (select 1 from public.courses where slug = 'quantum-algorithms-course');

with course as (
  select id from public.courses where slug = 'quantum-algorithms-course'
),
drafts (order_index, slug, title, description, duration_minutes, content) as (
  values
  (1, 'oracles-and-phase-kickback', 'Oracles and Phase Kickback',
   'How a function becomes a quantum gate, and how its value becomes a phase.', 30,
$md$# Oracles and Phase Kickback

## Learning objectives

- Write a classical function as a reversible quantum gate.
- Explain phase kickback.
- Say what query complexity measures.

## Why we need oracles

Many quantum algorithms ask questions about a function $f$. A gate must be reversible, but $f$ often is not: if $f(0)=f(1)$, the output alone does not tell you the input. The standard solution keeps the input and adds the output to a second register:

$$U_f\,|x\rangle|y\rangle = |x\rangle|y \oplus f(x)\rangle$$

Here $\oplus$ is addition modulo 2. Applying $U_f$ twice gives $y \oplus f(x) \oplus f(x) = y$, so $U_f$ is its own inverse.

## Asking about every input at once

Put the input register in an equal superposition and the target in $|0\rangle$:

$$U_f\,\frac{1}{\sqrt{2^n}}\sum_x |x\rangle|0\rangle = \frac{1}{\sqrt{2^n}}\sum_x |x\rangle|f(x)\rangle$$

This does **not** give you every value of $f$. Measuring returns one random pair $(x, f(x))$. Useful algorithms need interference as well.

## Phase kickback

Now put the target in $|-\rangle=\frac{|0\rangle-|1\rangle}{\sqrt2}$. Flipping it gives $X|-\rangle=-|-\rangle$. So:

- if $f(x)=0$, nothing changes;
- if $f(x)=1$, the state picks up a factor $-1$.

$$U_f\,|x\rangle|-\rangle = (-1)^{f(x)}\,|x\rangle|-\rangle$$

The target is unchanged, and the answer appears as a **phase on the input register**. In a superposition these phases are relative phases, so later gates can make them interfere.

## Worked example

Let $f(x)=x$ for one bit. Then $U_f$ is a CNOT. Starting from $|+\rangle|-\rangle$:

$$\frac{|0\rangle+|1\rangle}{\sqrt2}|-\rangle \;\to\; \frac{|0\rangle-|1\rangle}{\sqrt2}|-\rangle = |-\rangle|-\rangle$$

The **control** qubit changed from $|+\rangle$ to $|-\rangle$, although a CNOT is usually described as changing the target.

## Query complexity

Query complexity counts how many times an algorithm uses the oracle. It is a clean way to compare algorithms, but it ignores the cost of building the oracle, which matters in practice.

## Common mistakes

- "The computer evaluates all inputs, so we know all outputs." Measurement gives one outcome.
- "Kickback changes the target." The target stays $|-\rangle$.

## Key takeaways

- $U_f$ stores $f(x)$ reversibly with XOR.
- A target in $|-\rangle$ turns $f(x)$ into the phase $(-1)^{f(x)}$.
- Superposition needs interference to be useful.
$md$),
  (2, 'deutsch-jozsa-algorithm', 'The Deutsch–Jozsa Algorithm',
   'Deciding whether a function is constant or balanced with one query.', 30,
$md$# The Deutsch–Jozsa Algorithm

## The problem

You are given an oracle for $f:\{0,1\}^n\to\{0,1\}$ and a promise: $f$ is either

- **constant** (the same value for every input), or
- **balanced** (0 for exactly half the inputs and 1 for the other half).

Decide which.

## Classical cost

To be certain, a classical method may need $2^{n-1}+1$ queries: after seeing the same value for half the inputs, one more query settles it. With randomness, a few queries already give high confidence. So the exponential gap is only for **exact** answers.

## The algorithm

1. Prepare $|0\rangle^{\otimes n}|-\rangle$.
2. Apply $H^{\otimes n}$ to the first register.
3. Apply $U_f$. By phase kickback:

$$\frac{1}{\sqrt{2^n}}\sum_x (-1)^{f(x)}|x\rangle$$

4. Apply $H^{\otimes n}$ again.
5. Measure the first register.

## Why it works

The amplitude of $|0\dots0\rangle$ after step 4 is

$$\frac{1}{2^n}\sum_x (-1)^{f(x)}$$

- **Constant:** every term has the same sign, so the amplitude is $\pm1$. You measure all zeros with certainty.
- **Balanced:** half the terms are $+1$ and half $-1$, so the amplitude is $0$. You never measure all zeros.

One query is enough.

## Worked example, n = 1

With $f(0)=0,\ f(1)=1$ (balanced): $|0\rangle \to |+\rangle \to |-\rangle \to |1\rangle$. The result is 1, so $f$ is balanced.

## What it teaches

The algorithm has little practical use, but it shows the common pattern: **superpose, mark with a phase, interfere, measure**.

## Common mistakes

- Forgetting the promise. If $f$ is neither constant nor balanced, the result proves nothing.
- Claiming an exponential advantage over randomized classical methods.

## Key takeaways

- All zeros means constant; anything else means balanced.
- Interference, not superposition alone, does the work.
$md$),
  (3, 'bernstein-vazirani-algorithm', 'The Bernstein–Vazirani Algorithm',
   'Finding a hidden bit string with one query.', 25,
$md$# The Bernstein–Vazirani Algorithm

## The problem

An oracle computes

$$f(x) = s\cdot x = s_1x_1 \oplus s_2x_2 \oplus \dots \oplus s_nx_n$$

for a secret string $s$ of $n$ bits. Find $s$.

## Classical cost

Query the strings $100\dots0$, $010\dots0$, and so on. Each one returns one bit of $s$, so $n$ queries are enough. They are also necessary, because each query returns only one bit of information.

## The algorithm

The circuit is the same as Deutsch–Jozsa.

1. Prepare $|0\rangle^{\otimes n}|-\rangle$ and apply $H^{\otimes n}$.
2. Apply the oracle:

$$\frac{1}{\sqrt{2^n}}\sum_x (-1)^{s\cdot x}|x\rangle$$

3. Apply $H^{\otimes n}$ and measure.

## Why it works

The Hadamard transform of a basis state is

$$H^{\otimes n}|s\rangle = \frac{1}{\sqrt{2^n}}\sum_x (-1)^{s\cdot x}|x\rangle$$

That is exactly the state after step 2. Since $H^{\otimes n}$ is its own inverse, step 3 returns $|s\rangle$. You read $s$ with certainty after **one** query.

## Worked example

Let $s=11$. After the oracle: $\frac12(|00\rangle-|01\rangle-|10\rangle+|11\rangle)=|-\rangle|-\rangle$. Two Hadamards give $|11\rangle$.

## Building the oracle

Place one CNOT from each input qubit $i$ with $s_i=1$ to the target. With the target in $|-\rangle$, each of those input qubits goes from $|+\rangle$ to $|-\rangle$.

## Key takeaways

- The phases of $s\cdot x$ are the Hadamard transform of $|s\rangle$.
- One quantum query replaces $n$ classical ones.
$md$),
  (4, 'grovers-search-algorithm', 'Grover''s Search Algorithm',
   'Quadratic speedup for unstructured search.', 40,
$md$# Grover's Search Algorithm

## The problem

Among $N=2^n$ items exactly one, $w$, satisfies $f(w)=1$. Nothing else is known about the order. Classically you need about $N/2$ checks on average. Grover needs about $\frac{\pi}{4}\sqrt N$.

## The two steps

Start from the uniform state $|s\rangle=\frac1{\sqrt N}\sum_x|x\rangle$ and repeat:

1. **Oracle:** flip the sign of the marked item, $|w\rangle\to-|w\rangle$.
2. **Diffusion:** apply $2|s\rangle\langle s|-I$, which reflects every amplitude about the mean.

The mean is slightly lowered by the negative amplitude, so reflecting about it raises the marked amplitude.

## Geometric view

Both steps are reflections in the plane spanned by $|w\rangle$ and the uniform state of the other items. Two reflections make a rotation by $2\theta$, where $\sin\theta=\frac1{\sqrt N}$. The start is at angle $\theta$, so after $k$ iterations

$$P(w)=\sin^2\big((2k+1)\theta\big)$$

For large $N$, $\theta\approx 1/\sqrt N$, and the probability is near 1 when $k\approx\frac{\pi}{4}\sqrt N$.

## Worked example, N = 4

Here $\sin\theta=\frac12$, so $\theta=30^\circ$. After one iteration the angle is $90^\circ$ and $P(w)=1$: a single query finds the item.

## Too many iterations

It is a rotation, so going past $90^\circ$ lowers the probability again. Stop at the right time.

## Several marked items

With $M$ marked items, about $\frac{\pi}{4}\sqrt{N/M}$ iterations are needed.

## Limits

- The speedup is **quadratic**, and it is known to be the best possible for unstructured search.
- The oracle must be built as a circuit that recognizes a solution. Grover does not search an ordinary database that has not been loaded.

## Key takeaways

- Oracle plus diffusion rotates the state toward the answer.
- Use about $\frac{\pi}{4}\sqrt N$ iterations, not more.
$md$),
  (5, 'quantum-fourier-transform', 'The Quantum Fourier Transform',
   'Turning patterns in phase into patterns you can measure.', 40,
$md$# The Quantum Fourier Transform

## Definition

For $N=2^n$, the quantum Fourier transform (QFT) acts on basis states as

$$\text{QFT}\,|j\rangle=\frac1{\sqrt N}\sum_{k=0}^{N-1} e^{2\pi i jk/N}|k\rangle$$

It is unitary, so it has an inverse, obtained by changing the sign of the exponent.

## Small cases

- $N=2$: the matrix is $\frac1{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$, the Hadamard gate.
- $j=0$: every phase is 1, so the result is the uniform superposition.

## Product form

Write $0.j_1j_2\dots$ for a binary fraction. The QFT of $|j_1j_2\dots j_n\rangle$ is

$$\frac{1}{\sqrt{2^n}}\big(|0\rangle+e^{2\pi i\,0.j_n}|1\rangle\big)\otimes\dots\otimes\big(|0\rangle+e^{2\pi i\,0.j_1j_2\dots j_n}|1\rangle\big)$$

Each output qubit carries a phase made from some of the input bits. That gives the circuit directly.

## The circuit

For each qubit: a Hadamard, then controlled phase rotations by $2\pi/2^m$ from the later qubits. Finish with swaps to reverse the order. This uses $n$ Hadamards and $\frac{n(n-1)}2$ controlled rotations, so about $n^2$ gates.

## Compared with the classical FFT

The FFT takes about $N\log N = n2^n$ steps. The QFT uses about $n^2$ gates, but it transforms **amplitudes**, which you cannot list by measuring. It is useful when the transformed state has a pattern that a few measurements reveal, such as a period.

## Why it finds periods

If a state has equal amplitudes at $x_0, x_0+r, x_0+2r,\dots$, its QFT concentrates near multiples of $N/r$. The unknown offset $x_0$ only becomes a phase.

## Key takeaways

- The QFT maps basis states to patterns of phase.
- It costs about $n^2$ gates.
- It does not output a list of Fourier coefficients.
$md$),
  (6, 'quantum-phase-estimation', 'Quantum Phase Estimation',
   'Reading an eigenvalue of a unitary as binary digits.', 35,
$md$# Quantum Phase Estimation

## The problem

A unitary $U$ has an eigenstate $|u\rangle$:

$$U|u\rangle=e^{2\pi i\theta}|u\rangle,\qquad 0\le\theta<1$$

Find $\theta$.

## The algorithm

1. Prepare $t$ counting qubits in $|+\rangle$ and the second register in $|u\rangle$.
2. Use counting qubit $k$ to control $U^{2^k}$. By phase kickback it becomes

$$\frac{|0\rangle+e^{2\pi i\,2^k\theta}|1\rangle}{\sqrt2}$$

3. Together, the counting qubits hold $\frac1{\sqrt{2^t}}\sum_m e^{2\pi i m\theta}|m\rangle$.
4. Apply the **inverse QFT** and measure.

If $\theta=m/2^t$ exactly, the result is $m$ with certainty. Otherwise you get a nearby value with high probability, at least $4/\pi^2\approx 0.405$ for the closest one.

## Precision

Each counting qubit adds about one binary digit. A few extra qubits make a good answer more likely.

## Worked example

Let $U=T$, with $T|1\rangle=e^{i\pi/4}|1\rangle$. Then $2\pi\theta=\pi/4$, so $\theta=\frac18$. With $t=3$, $m=8\cdot\frac18=1$, and the counting register reads $001$.

## If the input is not an eigenstate

A state $\sum_j c_j|u_j\rangle$ gives an estimate of $\theta_j$ with probability $|c_j|^2$. This is how it can be used even when eigenstates are not known exactly.

## Cost

The powers $U^{2^k}$ dominate. Phase estimation is practical only when they can be implemented efficiently. Long controlled circuits also need low noise, usually with error correction.

## Key takeaways

- Kickback writes $\theta$ into phases; the inverse QFT makes it readable.
- More counting qubits give more digits.
$md$),
  (7, 'shors-algorithm', 'Shor''s Algorithm',
   'Factoring by finding the order of a number.', 45,
$md$# Shor's Algorithm

## The idea

Shor's algorithm factors $N$ by finding the **order** of a number $a$ modulo $N$: the smallest positive $r$ with $a^r\equiv1\pmod N$. Finding the order is the quantum part. Everything else is classical.

## From order to factors

1. If $N$ is even or a perfect power, handle it classically.
2. Pick a random $a$ with $1<a<N$. If $\gcd(a,N)>1$, you already have a factor.
3. Find the order $r$.
4. If $r$ is odd, or $a^{r/2}\equiv-1\pmod N$, pick another $a$.
5. Otherwise $(a^{r/2}-1)(a^{r/2}+1)\equiv0\pmod N$, and $\gcd(a^{r/2}\pm1,N)$ gives non-trivial factors.

For an odd $N$ with at least two different prime factors, a random $a$ works with probability at least $\frac12$.

## Worked example

Factor $15$ with $a=7$: $7^1=7,\ 7^2=49\equiv4,\ 7^3\equiv13,\ 7^4\equiv1$. So $r=4$ and $7^{2}=49$.

$$\gcd(49-1,15)=3,\qquad \gcd(49+1,15)=5$$

## The quantum part

Let $U|y\rangle=|ay \bmod N\rangle$. Its eigenvalues are $e^{2\pi i s/r}$ for $s=0,\dots,r-1$. A handy fact is that $|1\rangle$ is an equal superposition of the corresponding eigenstates, so we do not need to prepare one. Phase estimation then returns an approximation to $s/r$ for a random $s$.

**Continued fractions** recover the fraction, and its denominator gives $r$ (or a divisor, if $s$ and $r$ share a factor, in which case we repeat).

## Cost and impact

The circuit has size polynomial in the number of digits of $N$, while the best known classical method takes super-polynomial time. A large error-corrected quantum computer could break RSA and elliptic-curve cryptography. Today's devices are far too small and noisy for key sizes in use, and post-quantum cryptography is being adopted in advance.

## Key takeaways

- Factoring reduces to order finding.
- Order finding is phase estimation of modular multiplication.
- The rest is classical number theory.
$md$),
  (8, 'variational-algorithms', 'Variational Algorithms: VQE and QAOA',
   'Short circuits trained by a classical optimizer.', 40,
$md$# Variational Algorithms: VQE and QAOA

## Why variational?

Phase estimation needs long, precise circuits. Variational algorithms use **short** parameterized circuits and let a classical computer do part of the work. They were designed with noisy devices in mind.

## The loop

1. Prepare $|\psi(\theta)\rangle$ with a parameterized circuit (an **ansatz**).
2. Measure a cost, usually an expectation value.
3. A classical optimizer proposes new parameters.
4. Repeat until the cost stops improving.

## VQE

The variational quantum eigensolver looks for the lowest energy of a Hamiltonian $H$. The **variational principle** says

$$\langle\psi(\theta)|H|\psi(\theta)\rangle\ \ge\ E_0$$

for every state, so the smallest value found is an upper bound on the ground energy $E_0$.

Write $H=\sum_i c_iP_i$ with Pauli strings $P_i$. Each $\langle P_i\rangle$ is estimated by measuring in a suitable basis, then the results are added.

### Worked example

Let $H=Z$ and $|\psi(\theta)\rangle=R_y(\theta)|0\rangle=\cos\frac\theta2|0\rangle+\sin\frac\theta2|1\rangle$. Then

$$\langle Z\rangle=\cos^2\tfrac\theta2-\sin^2\tfrac\theta2=\cos\theta$$

The minimum is $-1$ at $\theta=\pi$, where the state is $|1\rangle$, the true ground state.

## QAOA

The quantum approximate optimization algorithm targets combinatorial problems such as MaxCut. It starts from the uniform superposition and alternates

- a **cost layer** $e^{-i\gamma C}$, which adds phases according to the objective, and
- a **mixer layer** $e^{-i\beta\sum_jX_j}$, which moves amplitude between candidates.

The angles $\gamma,\beta$ are optimized. Adding layers cannot worsen the best achievable value, but it makes circuits longer and noisier.

## Difficulties

- **Barren plateaus:** for many ansätze, gradients shrink exponentially with the number of qubits.
- **Shot noise:** halving the statistical error takes about four times as many shots.
- **No general proof of advantage** over the best classical methods.

## Key takeaways

- A quantum device estimates the cost; a classical optimizer updates the parameters.
- VQE gives an upper bound on the ground energy.
- QAOA alternates cost and mixer layers.
$md$)
)
insert into public.lessons
  (course_id, title, slug, description, content, order_index, duration_minutes, is_published)
select course.id, d.title, d.slug, d.description, d.content, d.order_index, d.duration_minutes, false
from drafts d
cross join course
where not exists (select 1 from public.lessons l where l.slug = d.slug);
