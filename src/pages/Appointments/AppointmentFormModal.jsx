import React, { useEffect, useRef } from 'react';
import { Modal, Form, Select, DatePicker, Input, Button } from 'antd';
import dayjs from 'dayjs';
import useAppointments from '../../modules/appointments/hooks/useAppointments';
import { PATIENT_MAP, DOCTOR_MAP } from '../../utils/appointmentMapping';

const { Option } = Select;
const { TextArea } = Input;

const AppointmentFormModal = ({ open, onClose, editingAppointment }) => {
  const [form] = Form.useForm();
  const { createAppointment, updateAppointment, actionLoading } =
    useAppointments();

  const isEditing = !!editingAppointment;

  // Track when actionLoading transitions true → false while modal is open
  // This is more reliable than watching `success`, which gets cleared by re-fetches
  const wasLoadingRef = useRef(false);
  useEffect(() => {
    if (open && actionLoading) {
      wasLoadingRef.current = true;
    }
    if (open && !actionLoading && wasLoadingRef.current) {
      wasLoadingRef.current = false;
      onClose();
      form.resetFields();
    }
    if (!open) {
      wasLoadingRef.current = false;
    }
  }, [actionLoading, open, onClose, form]);

  useEffect(() => {
    if (open) {
      if (isEditing) {
        form.setFieldsValue({
          patient_id: editingAppointment.patient_id,
          doctor_id: editingAppointment.doctor_id,
          scheduled_at: editingAppointment.scheduled_at
            ? dayjs(editingAppointment.scheduled_at)
            : null,
          notes: editingAppointment.notes ?? '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [open]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const payload = {
          patient_id: values.patient_id,
          doctor_id: values.doctor_id,
          scheduled_at: values.scheduled_at.format('YYYY-MM-DD HH:mm:ss'),
          notes: values.notes ?? '',
        };
        if (isEditing) {
          updateAppointment({ id: editingAppointment.id, ...payload });
        } else {
          createAppointment(payload);
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
      width={560}
      title={isEditing ? 'Reschedule Appointment' : 'New Appointment'}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        style={{ marginTop: 16 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            name="patient_id"
            label="Patient"
            rules={[{ required: true, message: 'Please select a patient' }]}
          >
            <Select placeholder="Select patient" showSearch style={{ width: '100%' }}>
              {Object.entries(PATIENT_MAP).map(([id, name]) => (
                <Option key={id} value={Number(id)}>{name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="doctor_id"
            label="Doctor"
            rules={[{ required: true, message: 'Please select a doctor' }]}
          >
            <Select placeholder="Select doctor" showSearch style={{ width: '100%' }}>
              {Object.entries(DOCTOR_MAP).map(([id, name]) => (
                <Option key={id} value={Number(id)}>{name}</Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="scheduled_at"
          label="Date & Time"
          rules={[{ required: true, message: 'Please pick a date and time' }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            format="DD/MM/YYYY HH:mm"
            style={{ width: '100%' }}
            disabledDate={(current) =>
              current && current < dayjs().startOf('day')
            }
          />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <TextArea
            rows={3}
            placeholder="Any notes..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            paddingTop: 8,
          }}
        >
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={actionLoading}>
            {isEditing ? 'Save Changes' : 'Create Appointment'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AppointmentFormModal;