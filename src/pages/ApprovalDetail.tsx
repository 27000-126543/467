import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  Home,
  FileCheck,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Phone,
  User,
  FileText,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Spin, Modal, Input, message } from 'antd';
import { useApprovalsStore } from '@/store/approvals';
import {
  formatDateTime,
  getApprovalStatusText,
  getApprovalTypeText,
  getInstitutionLevelText,
} from '@/utils/format';
import { cn } from '@/lib/utils';
import { mockInstitutions, mockAlerts } from '@/mock/data';

const { TextArea } = Input;

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');

  const {
    loading,
    selectedApproval,
    initApprovals,
    fetchApprovalById,
    approveApproval,
    rejectApproval,
    resubmitApproval,
  } = useApprovalsStore();

  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [resubmitModalVisible, setResubmitModalVisible] = useState(false);
  const [approveComment, setApproveComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [rectificationNote, setRectificationNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initApprovals();
  }, [initApprovals]);

  useEffect(() => {
    if (id) {
      fetchApprovalById(id);
    }
  }, [id, fetchApprovalById]);

  useEffect(() => {
    if (action === 'approve' && selectedApproval) {
      setApproveModalVisible(true);
    }
  }, [action, selectedApproval]);

  const relatedInstitution = useMemo(() => {
    if (!selectedApproval) return null;
    return mockInstitutions.find((i) => i.id === selectedApproval.institutionId) || null;
  }, [selectedApproval]);

  const relatedAlert = useMemo(() => {
    if (!selectedApproval) return null;
    if (selectedApproval.alertSnapshot) {
      return {
        ...selectedApproval.alertSnapshot,
        institutionId: selectedApproval.institutionId,
        institutionName: selectedApproval.institutionName,
        status: 'pending' as const,
      };
    }
    return mockAlerts.find((a) => a.id === selectedApproval.alertId) || null;
  }, [selectedApproval]);

  const handleApprove = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const success = await approveApproval(id, approveComment || '同意');
      if (success) {
        message.success('审批通过成功');
        setApproveModalVisible(false);
        setApproveComment('');
      }
    } catch (error) {
      message.error('审批失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!rejectComment.trim()) {
      message.warning('请填写驳回原因');
      return;
    }
    setSubmitting(true);
    try {
      const success = await rejectApproval(id, rejectComment);
      if (success) {
        message.success('审批已驳回');
        setRejectModalVisible(false);
        setRejectComment('');
      }
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!id) return;
    if (!rectificationNote.trim()) {
      message.warning('请填写整改说明');
      return;
    }
    setSubmitting(true);
    try {
      const success = await resubmitApproval(id, rectificationNote);
      if (success) {
        message.success('已重新提交审批');
        setResubmitModalVisible(false);
        setRectificationNote('');
      }
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending_principal':
      case 'pending_district':
      case 'pending_city':
        return 'bg-warning-50 text-warning-600 border-warning-200';
      case 'approved':
        return 'bg-health-50 text-health-600 border-health-200';
      case 'rejected':
        return 'bg-danger-50 text-danger-600 border-danger-200';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'class_adjustment':
        return 'bg-primary-50 text-primary-600 border-primary-200';
      case 'enrollment_suspension':
        return 'bg-danger-50 text-danger-600 border-danger-200';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  const getStageStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-health-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-danger-500" />;
      default:
        return <Clock className="w-5 h-5 text-neutral-400" />;
    }
  };

  const canApprove = selectedApproval && (
    selectedApproval.status === 'pending_principal' ||
    selectedApproval.status === 'pending_district' ||
    selectedApproval.status === 'pending_city'
  );

  const canResubmit = selectedApproval && selectedApproval.status === 'rejected';

  if (loading && !selectedApproval) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!selectedApproval) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="w-16 h-16 text-warning-400 mb-4" />
        <p className="text-neutral-500 mb-4">审批记录不存在</p>
        <button
          onClick={() => navigate('/approvals')}
          className="text-primary-600 hover:text-primary-700"
        >
          返回审批列表
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <button
          onClick={() => navigate('/approvals')}
          className="flex items-center gap-1 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => navigate('/approvals')}
          className="hover:text-primary-600 transition-colors"
        >
          审批中心
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-neutral-700 font-medium">审批详情</span>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-xl font-bold text-neutral-800">
                {selectedApproval.institutionName}
              </h1>
              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-sm font-mono rounded-lg">
                编号：{selectedApproval.id}
              </span>
              <span
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full border',
                  getTypeBadgeStyle(selectedApproval.type)
                )}
              >
                {getApprovalTypeText(selectedApproval.type)}
              </span>
              <span
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full border',
                  getStatusBadgeStyle(selectedApproval.status)
                )}
              >
                {getApprovalStatusText(selectedApproval.status)}
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              创建时间：{formatDateTime(selectedApproval.createdAt)}
            </p>
          </div>

          {canApprove && (
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModalVisible(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-danger-600 bg-danger-50 rounded-xl hover:bg-danger-100 transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
                驳回
              </button>
              <button
                onClick={() => setApproveModalVisible(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm hover:shadow-md"
              >
                <ThumbsUp className="w-4 h-4" />
                通过
              </button>
            </div>
          )}

          {canResubmit && (
            <button
              onClick={() => setResubmitModalVisible(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl hover:from-warning-600 hover:to-warning-700 transition-all shadow-sm hover:shadow-md"
            >
              <Send className="w-4 h-4" />
              重新提交
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">审批进度</h2>
            <p className="text-xs text-neutral-500">三级审批流程跟踪</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-neutral-200" />
          <div className="flex justify-between relative">
            {selectedApproval.stages.map((stage, index) => {
              const isActive = stage.status !== 'pending';
              const isCurrent = selectedApproval.status !== 'approved' &&
                selectedApproval.status !== 'rejected' &&
                index === selectedApproval.currentStage - 1;

              return (
                <div
                  key={index}
                  className={cn(
                    'flex flex-col items-center relative z-10 flex-1',
                    index === 0 ? 'items-start' : '',
                    index === selectedApproval.stages.length - 1 ? 'items-end' : ''
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      stage.status === 'approved'
                        ? 'bg-health-100'
                        : stage.status === 'rejected'
                        ? 'bg-danger-100'
                        : isCurrent
                        ? 'bg-primary-100 ring-4 ring-primary-50'
                        : 'bg-neutral-100'
                    )}
                  >
                    {stage.status === 'approved' ? (
                      <CheckCircle2 className="w-5 h-5 text-health-500" />
                    ) : stage.status === 'rejected' ? (
                      <XCircle className="w-5 h-5 text-danger-500" />
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          isCurrent ? 'text-primary-600' : 'text-neutral-400'
                        )}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        stage.status === 'approved'
                          ? 'text-health-600'
                          : stage.status === 'rejected'
                          ? 'text-danger-600'
                          : isCurrent
                          ? 'text-primary-600'
                          : 'text-neutral-500'
                      )}
                    >
                      {stage.role}
                    </p>
                    {stage.handlerName && (
                      <p className="text-xs text-neutral-400 mt-1">
                        {stage.handlerName}
                      </p>
                    )}
                    {stage.handledAt && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatDateTime(stage.handledAt)}
                      </p>
                    )}
                    {stage.comment && (
                      <div className="mt-2 p-2 bg-neutral-50 rounded-lg text-xs text-neutral-600 max-w-[200px]">
                        <div className="flex items-start gap-1">
                          <MessageSquare className="w-3 h-3 text-neutral-400 mt-0.5 flex-shrink-0" />
                          <span>{stage.comment}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">拟采取措施说明</h2>
                <p className="text-xs text-neutral-500">整改方案与预期效果</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                <h3 className="text-sm font-semibold text-primary-700 mb-2">具体措施</h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {selectedApproval.proposedAction}
                </p>
              </div>

              {selectedApproval.expectedEffect && (
                <div className="p-4 bg-health-50/50 rounded-xl border border-health-100">
                  <h3 className="text-sm font-semibold text-health-700 mb-2">预期效果</h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {selectedApproval.expectedEffect}
                  </p>
                </div>
              )}

              {selectedApproval.escalationReason && (
                <div className="p-4 bg-warning-50/50 rounded-xl border border-warning-100">
                  <h3 className="text-sm font-semibold text-warning-700 mb-2">升级原因</h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {selectedApproval.escalationReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {relatedAlert && (
            <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-danger-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-danger-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-800">关联预警信息</h2>
                  <p className="text-xs text-neutral-500">触发本次审批的预警详情</p>
                </div>
              </div>

              <div className="p-4 bg-danger-50/50 rounded-xl border border-danger-200">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-danger-100 text-danger-700 text-xs font-medium rounded-full">
                        {relatedAlert.level}级预警
                      </span>
                      <span className="text-xs text-neutral-500">
                        {relatedAlert.type === 'health_abnormal' ? '健康异常' :
                         relatedAlert.type === 'teacher_ratio' ? '师生比' : '招生缺口'}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-neutral-800">
                      {relatedAlert.description}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-danger-200/50">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">阈值</p>
                    <p className="text-sm font-semibold text-neutral-700">
                      {relatedAlert.threshold}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">实际值</p>
                    <p className="text-sm font-semibold text-danger-600">
                      {relatedAlert.actualValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">连续天数</p>
                    <p className="text-sm font-semibold text-neutral-700">
                      {relatedAlert.consecutiveDays}天
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/alerts/${relatedAlert.id}`)}
                  className="mt-3 text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
                >
                  查看预警详情 →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {relatedInstitution && (
            <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-800">关联机构信息</h2>
                  <p className="text-xs text-neutral-500">机构基本情况</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-700">
                    {relatedInstitution.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-600">
                    {relatedInstitution.address.province}
                    {relatedInstitution.address.city}
                    {relatedInstitution.address.district}
                    {relatedInstitution.address.detail}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-600">
                    {relatedInstitution.contactPerson}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-600">
                    {relatedInstitution.contactPhone}
                  </span>
                </div>

                <div className="pt-3 border-t border-neutral-100">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-neutral-50 rounded-lg">
                      <p className="text-lg font-bold text-primary-600">
                        {relatedInstitution.studentCount}
                      </p>
                      <p className="text-xs text-neutral-500">学生数</p>
                    </div>
                    <div className="p-2 bg-neutral-50 rounded-lg">
                      <p className="text-lg font-bold text-health-600">
                        {relatedInstitution.teacherCount}
                      </p>
                      <p className="text-xs text-neutral-500">教师数</p>
                    </div>
                    <div className="p-2 bg-neutral-50 rounded-lg">
                      <p className="text-lg font-bold text-warning-600">
                        {getInstitutionLevelText(relatedInstitution.level)}
                      </p>
                      <p className="text-xs text-neutral-500">等级</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/institution/${relatedInstitution.id}`)}
                  className="w-full mt-2 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  查看机构详情
                </button>
              </div>
            </div>
          )}

          {(selectedApproval.processHistory && selectedApproval.processHistory.length > 0) && (
            <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-800">处理历史记录</h2>
                  <p className="text-xs text-neutral-500">各节点操作轨迹</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-neutral-200" />
                <div className="space-y-4">
                  {[...selectedApproval.processHistory].reverse().map((record, idx) => (
                    <div key={idx} className="relative flex gap-3">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 relative z-10',
                        record.status === 'approved' ? 'bg-health-100' :
                        record.status === 'rejected' ? 'bg-danger-100' : 'bg-neutral-100'
                      )}>
                        {record.status === 'approved' ? (
                          <CheckCircle2 className="w-4 h-4 text-health-500" />
                        ) : record.status === 'rejected' ? (
                          <XCircle className="w-4 h-4 text-danger-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-neutral-800">
                            {record.role}
                            <span className={cn(
                              'ml-2 px-1.5 py-0.5 text-xs font-medium rounded',
                              record.status === 'approved' ? 'bg-health-50 text-health-600' :
                              record.status === 'rejected' ? 'bg-danger-50 text-danger-600' :
                              'bg-neutral-50 text-neutral-600'
                            )}>
                              {record.status === 'approved' ? '通过' :
                               record.status === 'rejected' ? '驳回' : '处理中'}
                            </span>
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 mb-1">
                          {record.handlerName} · {record.handledAt}
                        </div>
                        {record.comment && (
                          <div className="p-2 bg-neutral-50 rounded-lg text-sm text-neutral-600">
                            <div className="flex items-start gap-1">
                              <MessageSquare className="w-3 h-3 text-neutral-400 mt-0.5 flex-shrink-0" />
                              <span>{record.comment}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {canApprove && (
        <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">审批操作</h2>
              <p className="text-xs text-neutral-500">请填写审批意见后进行操作</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                审批意见
              </label>
              <TextArea
                rows={4}
                placeholder="请输入您的审批意见..."
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModalVisible(true)}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-danger-600 bg-danger-50 rounded-xl hover:bg-danger-100 transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
                驳回申请
              </button>
              <button
                onClick={() => setApproveModalVisible(true)}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm hover:shadow-md"
              >
                <ThumbsUp className="w-4 h-4" />
                通过审批
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        title="确认通过审批"
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => setApproveModalVisible(false)}
        confirmLoading={submitting}
        okText="确认通过"
        cancelText="取消"
        okButtonProps={{ className: 'bg-primary-500 hover:bg-primary-600' }}
      >
        <p className="text-neutral-600 mb-4">
          您确定要通过此审批吗？通过后将进入下一审批阶段。
        </p>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            审批意见（选填）
          </label>
          <TextArea
            rows={3}
            placeholder="请输入审批意见..."
            value={approveComment}
            onChange={(e) => setApproveComment(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        title="驳回审批"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        confirmLoading={submitting}
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ className: 'bg-danger-500 hover:bg-danger-600' }}
      >
        <p className="text-neutral-600 mb-4">
          请填写驳回原因，驳回后审批流程将终止。
        </p>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            驳回原因 <span className="text-danger-500">*</span>
          </label>
          <TextArea
            rows={4}
            placeholder="请详细说明驳回原因..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={resubmitModalVisible}
        title="重新提交审批"
        onCancel={() => setResubmitModalVisible(false)}
        onOk={handleResubmit}
        confirmLoading={submitting}
        okText="确认提交"
        cancelText="取消"
        okButtonProps={{
          className:
            '!bg-gradient-to-r !from-warning-500 !to-warning-600 hover:!from-warning-600 hover:!to-warning-700',
        }}
      >
        <div className="space-y-4 mt-4">
          <p className="text-sm text-neutral-600">
            请填写整改说明，补充材料，重新提交后将从第一阶段重新审批。
          </p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              整改说明 <span className="text-danger-500">*</span>
            </label>
            <TextArea
              rows={4}
              placeholder="请详细说明整改措施和改进方案..."
              value={rectificationNote}
              onChange={(e) => setRectificationNote(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
