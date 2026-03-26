import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Input, Form, Alert } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone, CheckCircleFilled } from '@ant-design/icons';
import styled from 'styled-components';
import { useThemeContext } from '../../context/ThemeContext';
import { lightTheme } from '../../themes/theme';
import { darkTheme } from '../../themes/darkTheme';
import { warmTheme } from '../../themes/warmTheme';
import {
  changePasswordRequest,
  clearChangePasswordState,
} from '../../modules/auth/authSlice';

// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  padding: 36px 40px;
  max-width: 860px;
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 6px;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 0 0 28px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${(p) => p.theme.colors.border};
  margin: 36px 0;
`;

const Card = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 14px;
  padding: 28px 32px;
  margin-bottom: 24px;
`;

const CardLabel = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 4px;
`;

const CardDescription = styled.p`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 0 0 20px;
`;

const ChangePasswordBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  background: ${(p) => p.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    opacity: 0.7;
  }
`;

/* ── Theme Palette Display ── */
const ThemeGrid = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const ThemeTile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px 14px;
  border-radius: 12px;
  border: 2px solid ${(p) => (p.$active ? p.$primary : p.theme.colors.border)};
  background: ${(p) => p.theme.colors.surface};
  min-width: 200px;
  flex: 1;
  position: relative;
  transition: border-color 0.2s ease;
`;

const ThemeName = styled.span`
  font-weight: 600;
  font-size: 13px;
  color: ${(p) => p.theme.colors.text};
  text-transform: capitalize;
  letter-spacing: 0.3px;
`;

const ActiveBadge = styled.span`
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 11px;
  font-weight: 600;
  color: ${(p) => p.$color};
  display: flex;
  align-items: center;
  gap: 3px;
`;

const PaletteRow = styled.div`
  display: flex;
  gap: 6px;
`;

const Swatch = styled.div`
  flex: 1;
  height: 32px;
  border-radius: 6px;
  background: ${(p) => p.$color};
  title: ${(p) => p.$label};
  position: relative;

  &:hover::after {
    content: '${(p) => p.$label}';
    position: absolute;
    bottom: -22px;
    left: 50%;
    transform: translateX(-50%);
    background: #000;
    color: #fff;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
    z-index: 999;
    pointer-events: none;
  }
`;

// ─── Theme definitions for palette display ─────────────────────────────────

const THEME_MAP = {
  default: { label: 'Light', obj: lightTheme },
  dark:    { label: 'Dark',  obj: darkTheme  },
  warm:    { label: 'Warm',  obj: warmTheme  },
};

const PALETTE_KEYS = [
  { key: 'primary',    label: 'Primary'    },
  { key: 'background', label: 'Background' },
  { key: 'surface',    label: 'Surface'    },
  { key: 'text',       label: 'Text'       },
  { key: 'border',     label: 'Border'     },
  { key: 'sidebarBg',  label: 'Sidebar'    },
  { key: 'danger',     label: 'Danger'     },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SecuritySettings = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);

  const { themeName } = useThemeContext();

  const { loading, error, success } = useSelector(
    (state) => state.auth.changePassword
  );

  // Close modal and reset form on success
  useEffect(() => {
    if (success) {
      form.resetFields();
      setModalOpen(false);
      dispatch(clearChangePasswordState());
    }
  }, [success, form, dispatch]);

  // Clear state when modal closes
  const handleCancel = () => {
    setModalOpen(false);
    form.resetFields();
    dispatch(clearChangePasswordState());
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        dispatch(
          changePasswordRequest({
            old_password: values.old_password,
            new_password: values.new_password,
          })
        );
      })
      .catch(() => {});
  };

  return (
    <PageWrapper>
      {/* ── Security Section ── */}
      <SectionTitle>Security</SectionTitle>
      <SectionSubtitle>Manage your account security settings.</SectionSubtitle>

      <Card>
        <CardLabel>Password</CardLabel>
        <CardDescription>
          Update your account password. You will need your current password to make this change.
        </CardDescription>
        <ChangePasswordBtn onClick={() => setModalOpen(true)}>
          <LockOutlined />
          Change Password
        </ChangePasswordBtn>
      </Card>

      <Divider />

      {/* ── Theme Preference Section ── */}
      <SectionTitle>Theme Preference</SectionTitle>
      <SectionSubtitle>
        Your active theme is <strong>{THEME_MAP[themeName]?.label ?? themeName}</strong>. Below is the full color palette for each available theme.
      </SectionSubtitle>

      <ThemeGrid>
        {Object.entries(THEME_MAP).map(([key, { label, obj }]) => {
          const isActive = themeName === key;
          const primary = obj.colors.primary;
          return (
            <ThemeTile key={key} $active={isActive} $primary={primary}>
              <ThemeName>{label} Theme</ThemeName>
              {isActive && (
                <ActiveBadge $color={primary}>
                  <CheckCircleFilled /> Active
                </ActiveBadge>
              )}
              <PaletteRow>
                {PALETTE_KEYS.map(({ key: colorKey, label: colorLabel }) => (
                  <Swatch
                    key={colorKey}
                    $color={obj.colors[colorKey]}
                    $label={colorLabel}
                    title={`${colorLabel}: ${obj.colors[colorKey]}`}
                  />
                ))}
              </PaletteRow>
            </ThemeTile>
          );
        })}
      </ThemeGrid>

      {/* ── Change Password Modal ── */}
      <Modal
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LockOutlined />
            Change Password
          </span>
        }
        open={modalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText="Update Password"
        confirmLoading={loading}
        okButtonProps={{ danger: false }}
        destroyOnClose
      >
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="old_password"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password.' }]}
          >
            <Input.Password
              placeholder="Enter current password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter a new password.' },
              { min: 6, message: 'Password must be at least 6 characters.' },
            ]}
          >
            <Input.Password
              placeholder="Enter new password (min. 6 characters)"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirm New Password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Please confirm your new password.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match.'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Re-enter new password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  );
};

export default SecuritySettings;