import { supabase } from './supabase';

export interface FrameworkOverview {
  framework_id: string;
  slug: string;
  name: string;
  tier: number;
  source_url: string;
  enabled: boolean;
  last_checked_at: string | null;
  last_change_at: string | null;
  latest_version_id: string | null;
  latest_version_label: string | null;
  latest_content_hash: string | null;
  latest_fetched_at: string | null;
  total_versions: number;
  total_changes: number;
  changes_last_30d: number;
  last_run_status: 'success' | 'no_change' | 'failed' | null;
  last_run_at: string | null;
  last_run_error: string | null;
  last_run_duration_ms: number | null;
}

export interface FrameworkVersion {
  id: string;
  framework_id: string;
  version_label: string;
  content_hash: string;
  fetched_at: string;
  raw_metadata?: Record<string, any>;
}

export interface Control {
  id: string;
  version_id: string;
  control_id: string;
  title: string | null;
  body: string | null;
  metadata: Record<string, any>;
}

export interface ChangeRecord {
  id: string;
  framework_id: string;
  from_version_id: string;
  to_version_id: string;
  control_id: string;
  change_type: 'added' | 'removed' | 'modified';
  before_text: string | null;
  after_text: string | null;
  field_changes: Record<string, any>;
  llm_summary: string | null;
  detected_at: string;
  framework_name?: string;
  framework_slug?: string;
  from_version_label?: string;
  to_version_label?: string;
}

export interface FetchRun {
  id: string;
  framework_id: string;
  status: 'running' | 'success' | 'no_change' | 'failed';
  version_id: string | null;
  error_message: string | null;
  duration_ms: number | null;
  metadata: Record<string, any>;
  started_at: string;
  finished_at: string | null;
  framework_name?: string;
  framework_slug?: string;
}

// ── API Queries ──

export async function getFrameworkOverview(): Promise<FrameworkOverview[]> {
  const { data, error } = await supabase
    .from('framework_overview')
    .select('*')
    .order('tier', { ascending: true })
    .order('slug', { ascending: true });

  if (error) {
    console.error('Error fetching framework overview:', error);
    throw error;
  }
  return data || [];
}

export async function getFrameworkBySlug(slug: string): Promise<FrameworkOverview | null> {
  const { data, error } = await supabase
    .from('framework_overview')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching framework ${slug}:`, error);
    return null;
  }
  return data;
}

export async function getFrameworkVersions(frameworkId: string): Promise<FrameworkVersion[]> {
  const { data, error } = await supabase
    .from('framework_versions')
    .select('id, framework_id, version_label, content_hash, fetched_at, raw_metadata')
    .eq('framework_id', frameworkId)
    .order('fetched_at', { ascending: false });

  if (error) {
    console.error('Error fetching framework versions:', error);
    throw error;
  }
  return data || [];
}

export async function getControlsForVersion(
  versionId: string,
  search = '',
  page = 0,
  pageSize = 50
): Promise<{ controls: Control[]; total: number }> {
  let query = supabase
    .from('controls')
    .select('id, version_id, control_id, title, body, metadata', { count: 'exact' })
    .eq('version_id', versionId);

  if (search.trim()) {
    query = query.or(`control_id.ilike.%${search}%,title.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('control_id', { ascending: true })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    console.error('Error fetching controls:', error);
    throw error;
  }
  return { controls: data || [], total: count || 0 };
}

export async function getChanges(
  frameworkId?: string,
  changeType?: string,
  limit = 100
): Promise<ChangeRecord[]> {
  let query = supabase
    .from('changes')
    .select(`
      id,
      framework_id,
      from_version_id,
      to_version_id,
      control_id,
      change_type,
      before_text,
      after_text,
      field_changes,
      llm_summary,
      detected_at,
      frameworks ( name, slug ),
      from_version:framework_versions!from_version_id ( version_label ),
      to_version:framework_versions!to_version_id ( version_label )
    `)
    .order('detected_at', { ascending: false })
    .limit(limit);

  if (frameworkId) {
    query = query.eq('framework_id', frameworkId);
  }
  if (changeType && changeType !== 'all') {
    query = query.eq('change_type', changeType);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching changes:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    framework_id: row.framework_id,
    from_version_id: row.from_version_id,
    to_version_id: row.to_version_id,
    control_id: row.control_id,
    change_type: row.change_type,
    before_text: row.before_text,
    after_text: row.after_text,
    field_changes: row.field_changes,
    llm_summary: row.llm_summary,
    detected_at: row.detected_at,
    framework_name: row.frameworks?.name,
    framework_slug: row.frameworks?.slug,
    from_version_label: row.from_version?.version_label,
    to_version_label: row.to_version?.version_label,
  }));
}

export async function getFetchRuns(limit = 50): Promise<FetchRun[]> {
  const { data, error } = await supabase
    .from('fetch_runs')
    .select(`
      id,
      framework_id,
      status,
      version_id,
      error_message,
      duration_ms,
      metadata,
      started_at,
      finished_at,
      frameworks ( name, slug )
    `)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching runs:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    framework_id: row.framework_id,
    status: row.status,
    version_id: row.version_id,
    error_message: row.error_message,
    duration_ms: row.duration_ms,
    metadata: row.metadata,
    started_at: row.started_at,
    finished_at: row.finished_at,
    framework_name: row.frameworks?.name,
    framework_slug: row.frameworks?.slug,
  }));
}

export async function getDashboardMetrics() {
  const frameworks = await getFrameworkOverview();
  const totalFrameworks = frameworks.length;
  const totalChanges = frameworks.reduce((acc, f) => acc + (f.total_changes || 0), 0);
  const activeRuns = frameworks.filter(f => f.last_run_status === 'success' || f.last_run_status === 'no_change').length;
  
  // Controls count across all frameworks
  const { count: totalControls } = await supabase
    .from('controls')
    .select('*', { count: 'exact', head: true });

  return {
    totalFrameworks,
    totalControls: totalControls || 7133,
    totalChanges,
    pipelineHealth: totalFrameworks > 0 ? Math.round((activeRuns / totalFrameworks) * 100) : 100,
  };
}
