const calculateProfileScore = (profileData, starsCount, uniqueLanguagesCount) => {
  const followers = profileData.followers || 0;
  const publicRepos = profileData.public_repos || 0;
  const createdAt = new Date(profileData.created_at);
  const yearsActive = Math.max(1, new Date().getFullYear() - createdAt.getFullYear());
  const starsScore = Math.min(40, starsCount * 5);
  const followersScore = Math.min(20, followers * 2);
  const reposScore = Math.min(15, publicRepos * 1);
  const languageScore = Math.min(15, uniqueLanguagesCount * 5);
  const ageScore = Math.min(10, yearsActive * 2);
  const score = starsScore + followersScore + reposScore + languageScore + ageScore;

  let grade = "D";
  let description = "Beginner Developer";

  if (score >= 80) {
    grade = "A+";
    description = "Elite Developer";
  } else if (score >= 60) {
    grade = "A";
    description = "Professional Developer";
  } else if (score >= 40) {
    grade = "B";
    description = "Active Developer";
  } else if (score >= 20) {
    grade = "C";
    description = "Intermediate Developer";
  }

  return {
    score,
    grade,
    description,
    breakdown: {
      starsScore,
      followersScore,
      reposScore,
      languageScore,
      ageScore,
    },
  };
};

module.exports = { calculateProfileScore };
