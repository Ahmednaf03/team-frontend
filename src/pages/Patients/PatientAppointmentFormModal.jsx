import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, Input, Button, message } from 'antd';
import styled, { useTheme } from 'styled-components';
import dayjs from 'dayjs';
import { CalendarPlus, Stethoscope, CalendarClock, FileText } from 'lucide-react';
import axiosClient from '../../services/axiosClient';

const { Option } = Select;
const { TextArea } = Input;

/* ─── Styled modal pieces ────────────────────────────────────────────────── */
const ModalHero = styled.div`
  background: linear-gradient(135deg, ${(p) => p.theme.colors.primary} 0%, #7c3aed 100%);
  margin: 0 0 24px;
  padding: 22px 24px;
  border-radius: 14px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeroIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HeroText = styled.div`
  h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  p {
    margin: 3px 0 0;
    font-size: 12.5px;
    opacity: 0.8;
  }
`;

const FieldLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 6px;
`;

const FieldIcon = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: ${(p) => p.$color || p.theme.colors.primary}14;
  color: ${(p) => p.$color || p.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid ${(p) => p.theme.colors.border};
`;

const PrimaryButton = styled(Button)`
  &.ant-btn-primary {
    background: linear-gradient(135deg, ${(p) => p.theme.colors.primary} 0%, #7c3aed 100%);
    border: none;
    font-weight: 600;
    height: 38px;
    padding: 0 22px;
    border-radius: 10px;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
    transition: all 0.2s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
    }
  }
`;

const CancelButton = styled(Button)`
  &.ant-btn-default {
    font-weight: 600;
    height: 38px;
    padding: 0 18px;
    border-radius: 10px;
    border: 1.5px solid ${(p) => p.theme.colors.border};
    color: ${(p) => p.theme.colors.textSecondary};

    &:hover {
      border-color: ${(p) => p.theme.colors.primary};
      color: ${(p) => p.theme.colors.primary};
    }
  }
`;

/**
 * PatientAppointmentFormModal
 *
 * Patient-only booking modal — uses direct axiosClient calls:
 *   - GET /api/staff → provider dropdown (backend narrows to providers)
 *   - POST /api/appointments → create appointment (backend derives patient_id from JWT)
 */
const PatientAppointmentFormModal = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const [form] = Form.useForm();
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch provider list when modal opens
  useEffect(() => {
    if (!open) return;
    form.resetFields();

    let cancelled = false;
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const res = await axiosClient.get('/staff', {
          params: { per_page: 500 },
          withCredentials: true,
        });
        if (cancelled) return;

        const raw = res.data?.data ?? res.data ?? [];
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);

        const mapped = list
          .filter((s) => s?.id)
          .map((s) => ({
            value: Number(s.id),
            label: s.name || s.full_name || s.email || `Provider #${s.id}`,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setDoctors(mapped);
      } catch {
        if (!cancelled) {
          message.error('Could not load providers.');
          setDoctors([]);
        }
      } finally {
        if (!cancelled) setLoadingDoctors(false);
      }
    };

    fetchDoctors();
    return () => { cancelled = true; };
  }, [open, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        setSubmitting(true);
        try {
          const payload = {
            doctor_id: values.doctor_id,
            scheduled_at: values.scheduled_at.format('YYYY-MM-DD HH:mm:ss'),
            notes: values.notes ?? '',
          };

          await axiosClient.post('/appointments', payload, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          });

          message.success('Appointment booked successfully!');
          form.resetFields();
          if (onSuccess) onSuccess();
        } catch (err) {
          message.error(
            err.response?.data?.message || 'Failed to book appointment.'
          );
        } finally {
          setSubmitting(false);
        }
      })
      .catch((err) => {
        console.warn('Validation error:', err);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={540}
      closable
      centered
      destroyOnClose
      closeIcon={
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: theme.colors.background,
          border: `1px solid ${theme.colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: theme.colors.textSecondary, fontSize: 15, fontWeight: 700, lineHeight: 1,
        }}>✕</div>
      }
      styles={{
        content: {
          background: theme.colors.surface,
          borderRadius: 18,
          overflow: 'hidden',
          padding: '0',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
        },
        header: { display: 'none' },
        body: { padding: '20px 24px 24px' },
        close: {
          position: 'absolute', top: 14, right: 14, zIndex: 10,
        },
      }}
    >
      {/* ── Gradient hero banner ── */}
      <ModalHero>
        <HeroIcon>
          <CalendarPlus size={22} color="#fff" />
        </HeroIcon>
        <HeroText>
          <h3>Book an Appointment</h3>
          <p>Choose a doctor, pick a time, and add notes</p>
        </HeroText>
      </ModalHero>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        {/* ── Doctor selector ── */}
        <FieldLabel>
          <FieldIcon $color="#7c3aed"><Stethoscope size={12} /></FieldIcon>
          Doctor / Provider
        </FieldLabel>
        <Form.Item
          name="doctor_id"
          rules={[{ required: true, message: 'Please select a doctor' }]}
          style={{ marginBottom: 18 }}
        >
          <Select
            placeholder="Select a provider"
            showSearch
            size="large"
            style={{ width: '100%' }}
            loading={loadingDoctors}
            optionFilterProp="children"
            notFoundContent={loadingDoctors ? 'Loading...' : 'No providers found'}
          >
            {doctors.map(({ value, label }) => (
              <Option key={value} value={value}>{label}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* ── Date & time ── */}
        <FieldLabel>
          <FieldIcon $color="#2563eb"><CalendarClock size={12} /></FieldIcon>
          Date & Time
        </FieldLabel>
        <Form.Item
          name="scheduled_at"
          rules={[{ required: true, message: 'Please pick a date and time' }]}
          style={{ marginBottom: 18 }}
        >
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="DD/MM/YYYY HH:mm"
            size="large"
            style={{ width: '100%' }}
            disabledDate={(current) =>
              current && current < dayjs().startOf('day')
            }
          />
        </Form.Item>

        {/* ── Notes ── */}
        <FieldLabel>
          <FieldIcon $color="#6b7280"><FileText size={12} /></FieldIcon>
          Notes <span style={{ fontWeight: 400, color: theme.colors.textSecondary, fontSize: 12, marginLeft: 4 }}>(optional)</span>
        </FieldLabel>
        <Form.Item name="notes" style={{ marginBottom: 8 }}>
          <TextArea
            rows={3}
            placeholder="Anything you'd like the doctor to know..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <FooterRow>
          <CancelButton onClick={handleCancel}>Cancel</CancelButton>
          <PrimaryButton type="primary" onClick={handleSubmit} loading={submitting}>
            Book Appointment
          </PrimaryButton>
        </FooterRow>
      </Form>
    </Modal>
  );
};

export default PatientAppointmentFormModal;
