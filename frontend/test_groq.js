async function test() {
  const text = 'This is a test resume for Dinesh. Frontend Developer at TechCorp. HTML, CSS, React.js.';
  const targetRole = 'frontend developer';
  const sys1 = 'You are a senior ATS expert, technical recruiter, and resume coach specializing in Indian tech placements. Return ONLY valid JSON. No markdown.';
  const user1 = `Analyze this resume for the target role: "${targetRole}"\n\nRESUME TEXT:\n${text}\n\nReturn EXACTLY this JSON structure: { "atsScore": 0-100, "atsSummary": "...", "overallAdvice": "...", "currentStrengths": [{ "strength": "...", "impact": "..." }], "grammarErrors": [{ "error": "...", "correction": "...", "context": "..." }], "formattingIssues": [{ "issue": "...", "fix": "..." }], "missingKeywords": [{ "keyword": "...", "importance": "Critical"|"High"|"Medium", "reason": "...", "whereToAdd": "..." }], "projectRewrites": [{ "original": "...", "improved": "...", "whyBetter": "..." }], "sectionScores": { "contact": 0-10, "summary": 0-10, "skills": 0-10, "experience": 0-10, "projects": 0-10, "education": 0-10, "certifications": 0-10 }, "companyCultureFit": "..." }`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: sys1 },
        { role: 'user', content: user1 }
      ],
      temperature: 0.3,
      max_tokens: 3000
    })
  });
  const data = await response.json();
  const rawText = data.choices[0].message.content;
  console.log('--- RAW TEXT ---');
  console.log(rawText);
  console.log('----------------');

  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  const extracted = rawText.substring(firstBrace, lastBrace + 1);

  try {
    JSON.parse(extracted);
    console.log('Parse successful');
  } catch (err) {
    console.log('PARSE ERROR:', err.message);
  }
}
test();
