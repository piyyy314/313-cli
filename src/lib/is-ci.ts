export const ciEnvs = new Set([
  'AZURE_PIPELINES',
  'bamboo.buildKey',
  'BITBUCKET_PIPE_STEP_RUN_UUID',
  'BUILD_ID',
  'BUILD_NUMBER',
  'BUILD_TAG', // Jenkins/Hudson - A string of the format jenkins-${JOB_NAME}-${BUILD_NUMBER}
  'BUILDKITE',
  'BUILDKITE_BUILD_ID', // Buildkite - The unique ID of the build
  'CI',
  'CI_BUILD_ID', // Common CI indicator
  'CI_COMMIT_SHA', // Common CI indicator
  'CI_JOB_ID', // Common CI indicator
  'CI_REPOSITORY_URL', // Common CI indicator
  'CI_SERVER_NAME', // Common CI indicator
  'CIRCLE_WORKFLOW_ID', // CircleCI - A unique ID for the entire workflow
  'CIRCLECI',
  'CODEBUILD', // AWS CodeBuild
  'CONTINUOUS_INTEGRATION',
  'DRONE',
  'GITHUB_ACTIONS',
  'GITLAB_CI',
  'GOCD_SERVER_HOST',
  'HUDSON_URL',
  'JENKINS_URL',
  'NETLIFY',
  'NOW_BUILD', // Vercel (Legacy)
  'PHPCI',
  'SEMAPHORE',
  'SNYK_CI',
  'SYSTEM_TEAMFOUNDATIONSERVERURI', // for Azure DevOps Pipelines
  'SYSTEM_TEAMPROJECTID', // Azure DevOps Pipelines - ID of the ADO project
  'TEAMCITY_VERSION',
  'TF_BUILD',
  'TRAVIS',
  'TRAVIS_PULL_REQUEST', // Travis CI - The PR # (false if not a PR build)
  'VERCEL',
]);

let cachedIsCI: boolean | null = null;

/**
 * Checks if the execution is running in a CI environment.
 *
 * Optimization (Bolt):
 * 1. O(1) Lookup: Avoids calling `Object.keys(process.env)`, which allocates a new array
 *    of keys and takes O(n) time with respect to the size of process.env. Instead, we directly check
 *    the small, fixed-size set of CI environment variables (ciEnvs).
 * 2. Caching: Caches the result in `cachedIsCI` to prevent repeated checks on subsequent calls.
 *    Caching is bypassed during tests (NODE_ENV === 'test') to ensure test isolation and mock-friendliness.
 */
export function isCI(): boolean {
  if (process.env.NODE_ENV === 'test') {
    return checkCI();
  }
  if (cachedIsCI !== null) {
    return cachedIsCI;
  }
  cachedIsCI = checkCI();
  return cachedIsCI;
}

function checkCI(): boolean {
  for (const envVar of ciEnvs) {
    if (process.env[envVar] !== undefined) {
      return true;
    }
  }
  return false;
}
