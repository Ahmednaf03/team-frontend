import React from 'react';
import styled, { useTheme } from 'styled-components';
import {
  Activity,
  Bell,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  FileText,
  Pill,
  ShieldPlus,
  SquareUserRound,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';

const iconMap = {
  activity: Activity,
  appointments: CalendarDays,
  billing: CircleDollarSign,
  clock: Clock3,
  notifications: Bell,
  patients: Users,
  prescriptions: Pill,
  records: FileText,
  security: ShieldPlus,
  staff: SquareUserRound,
  user: UserRound,
  provider: Stethoscope,
};

const DashboardShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
`;

const HeroCard = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr);
  gap: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const HeroPanel = styled.div`
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, ${(props) => props.theme.colors.primary}33, transparent 34%),
    linear-gradient(135deg, ${(props) => props.theme.colors.surface}, ${(props) => props.theme.colors.background});
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 28px;
  padding: 1.75rem;
  min-height: 220px;
`;

const HeroKicker = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: ${(props) => props.theme.colors.primary};
  font-weight: 700;
`;

const HeroTitle = styled.h1`
  margin: 0.75rem 0 0;
  font-size: clamp(1.8rem, 3vw, 2.7rem);
  line-height: 1.08;
  color: ${(props) => props.theme.colors.text};
`;

const HeroText = styled.p`
  max-width: 54ch;
  margin: 0.85rem 0 1.4rem;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.98rem;
  line-height: 1.6;
`;

const HeroPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const HeroPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.95rem;
  border-radius: 999px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.text};
  font-size: 0.92rem;
  font-weight: 600;
`;

const HeroSidebar = styled.div`
  display: grid;
  gap: 1rem;
`;

const MiniPanel = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 24px;
  padding: 1.25rem;
`;

const MiniLabel = styled.div`
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const MiniValue = styled.div`
  margin-top: 0.5rem;
  font-size: 2rem;
  font-weight: 800;
  color: ${(props) => props.theme.colors.text};
`;

const MiniHint = styled.div`
  margin-top: 0.4rem;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Tile = styled.article`
  grid-column: span ${(props) => props.$cols || 4};
  min-height: ${(props) => props.$minHeight || 220}px;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 24px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 10px 24px rgba(44, 62, 80, 0.05);

  @media (max-width: 1200px) {
    grid-column: span ${(props) => Math.min(props.$cols || 4, 6)};
  }

  @media (max-width: 720px) {
    grid-column: span 1;
  }
`;

const TileHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
`;

const TileTitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const TileTitle = styled.h2`
  margin: 0;
  font-size: 1.02rem;
  color: ${(props) => props.theme.colors.text};
`;

const TileSubtitle = styled.p`
  margin: 0;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.45;
`;

const IconBadge = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: ${(props) => props.theme.colors.primary};
  background: ${(props) => props.theme.colors.primary}18;
`;

const MetricValue = styled.div`
  font-size: clamp(1.9rem, 3vw, 2.5rem);
  font-weight: 800;
  color: ${(props) => props.theme.colors.text};
`;

const MetricCaption = styled.div`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.92rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
`;

const StatCard = styled.div`
  border-radius: 18px;
  padding: 0.9rem;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const StatLabel = styled.div`
  font-size: 0.83rem;
  color: ${(props) => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const StatValue = styled.div`
  margin-top: 0.45rem;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
`;

const TrendBars = styled.div`
  display: grid;
  gap: 0.8rem;
`;

const TrendRow = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr 48px;
  gap: 0.75rem;
  align-items: center;
`;

const TrendLabel = styled.div`
  font-size: 0.88rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const TrendTrack = styled.div`
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: ${(props) => props.theme.colors.background};
`;

const TrendFill = styled.div`
  width: ${(props) => props.$width}%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, ${(props) => props.theme.colors.primary}, #7bc4ff);
`;

const TrendValue = styled.div`
  text-align: right;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const ListItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const ItemMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const ItemTitle = styled.div`
  color: ${(props) => props.theme.colors.text};
  font-weight: 600;
  font-size: 0.95rem;
`;

const ItemMeta = styled.div`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.84rem;
  line-height: 1.4;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 82px;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  color: ${(props) => props.$toneColor || props.theme.colors.primary};
  background: ${(props) => props.$toneBg || `${props.theme.colors.primary}18`};
`;

const SegmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
`;

const Segment = styled.div`
  padding: 1rem;
  border-radius: 18px;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
`;

const SegmentValue = styled.div`
  font-size: 1.45rem;
  font-weight: 800;
  color: ${(props) => props.theme.colors.text};
`;

const SegmentLabel = styled.div`
  margin-top: 0.25rem;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.86rem;
`;

const formatCurrency = (value) => {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : `Rs. ${numeric.toFixed(2)}`;
};

const statusTone = (status, theme) => {
  switch (String(status).toUpperCase()) {
    case 'PAID':
    case 'DISPENSED':
    case 'COMPLETED':
    case 'ACTIVE':
      return { bg: '#e8f7ef', color: '#1f8f57' };
    case 'PENDING':
    case 'SCHEDULED':
      return { bg: '#fff7e6', color: '#b7791f' };
    case 'CANCELLED':
      return { bg: '#fdeceb', color: theme.colors.danger };
    default:
      return { bg: `${theme.colors.primary}18`, color: theme.colors.primary };
  }
};

function MetricTile({ tile }) {
  return (
    <>
      <MetricValue>{tile.value}</MetricValue>
      {tile.caption ? <MetricCaption>{tile.caption}</MetricCaption> : null}
      {tile.stats?.length ? (
        <StatGrid>
          {tile.stats.map((stat) => (
            <StatCard key={stat.label}>
              <StatLabel>{stat.label}</StatLabel>
              <StatValue>{stat.value}</StatValue>
            </StatCard>
          ))}
        </StatGrid>
      ) : null}
    </>
  );
}

function TrendTile({ tile }) {
  const maxValue = Math.max(...tile.items.map((item) => item.value), 1);

  return (
    <TrendBars>
      {tile.items.map((item) => (
        <TrendRow key={item.label}>
          <TrendLabel>{item.label}</TrendLabel>
          <TrendTrack>
            <TrendFill $width={(item.value / maxValue) * 100} />
          </TrendTrack>
          <TrendValue>{item.value}</TrendValue>
        </TrendRow>
      ))}
    </TrendBars>
  );
}

function ListTile({ tile, theme }) {
  return (
    <List>
      {tile.items.map((item) => {
        const tone = statusTone(item.badge, theme);

        return (
          <ListItem key={item.id || item.title}>
            <ItemMain>
              <ItemTitle>{item.title}</ItemTitle>
              <ItemMeta>{item.meta}</ItemMeta>
            </ItemMain>
            {item.badge ? <Badge $toneBg={tone.bg} $toneColor={tone.color}>{item.badge}</Badge> : null}
          </ListItem>
        );
      })}
    </List>
  );
}

function SegmentsTile({ tile }) {
  return (
    <SegmentGrid>
      {tile.items.map((item) => (
        <Segment key={item.label}>
          <SegmentValue>{item.value}</SegmentValue>
          <SegmentLabel>{item.label}</SegmentLabel>
        </Segment>
      ))}
    </SegmentGrid>
  );
}

function RevenueTile({ tile, theme }) {
  const paidTotal = tile.items
    .filter((item) => item.status === 'PAID')
    .reduce((sum, item) => sum + Number(item.total_amount), 0);

  const pendingTotal = tile.items
    .filter((item) => item.status === 'PENDING')
    .reduce((sum, item) => sum + Number(item.total_amount), 0);

  return (
    <>
      <SegmentGrid>
        <Segment>
          <SegmentValue>{formatCurrency(paidTotal)}</SegmentValue>
          <SegmentLabel>Paid Revenue</SegmentLabel>
        </Segment>
        <Segment>
          <SegmentValue>{formatCurrency(pendingTotal)}</SegmentValue>
          <SegmentLabel>Pending Collection</SegmentLabel>
        </Segment>
      </SegmentGrid>
      <List>
        {tile.items.map((item) => {
          const tone = statusTone(item.status, theme);

          return (
            <ListItem key={item.id}>
              <ItemMain>
                <ItemTitle>Invoice #{item.id}</ItemTitle>
                <ItemMeta>
                  Patient #{item.patient_id} • Prescription #{item.prescription_id}
                </ItemMeta>
              </ItemMain>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                <Badge $toneBg={tone.bg} $toneColor={tone.color}>{item.status}</Badge>
                <ItemTitle>{formatCurrency(item.total_amount)}</ItemTitle>
              </div>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}

function StaffTile({ tile, theme }) {
  const roleCounts = tile.items.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <SegmentGrid>
        {Object.entries(roleCounts).map(([role, count]) => (
          <Segment key={role}>
            <SegmentValue>{count}</SegmentValue>
            <SegmentLabel>{role}</SegmentLabel>
          </Segment>
        ))}
      </SegmentGrid>
      <List>
        {tile.items.slice(0, 4).map((member) => {
          const tone = statusTone(member.status, theme);

          return (
            <ListItem key={member.id}>
              <ItemMain>
                <ItemTitle>{member.name}</ItemTitle>
                <ItemMeta>{member.email}</ItemMeta>
              </ItemMain>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                <Badge $toneBg={tone.bg} $toneColor={tone.color}>{member.status}</Badge>
                <ItemMeta style={{ textTransform: 'capitalize' }}>{member.role}</ItemMeta>
              </div>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}

function PrescriptionsTile({ tile, theme }) {
  const pendingCount = tile.items.filter((item) => item.status === 'PENDING').length;
  const dispensedCount = tile.items.filter((item) => item.status === 'DISPENSED').length;

  return (
    <>
      <SegmentGrid>
        <Segment>
          <SegmentValue>{tile.items.length}</SegmentValue>
          <SegmentLabel>Total Prescriptions</SegmentLabel>
        </Segment>
        <Segment>
          <SegmentValue>{pendingCount}</SegmentValue>
          <SegmentLabel>Pending</SegmentLabel>
        </Segment>
        <Segment>
          <SegmentValue>{dispensedCount}</SegmentValue>
          <SegmentLabel>Dispensed</SegmentLabel>
        </Segment>
      </SegmentGrid>
      <List>
        {tile.items.slice(0, 5).map((item) => {
          const tone = statusTone(item.status, theme);

          return (
            <ListItem key={item.id}>
              <ItemMain>
                <ItemTitle>Prescription #{item.id}</ItemTitle>
                <ItemMeta>Patient #{item.patient_id} • Appointment #{item.appointment_id}</ItemMeta>
              </ItemMain>
              <Badge $toneBg={tone.bg} $toneColor={tone.color}>{item.status}</Badge>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}

function TileBody({ tile, theme }) {
  switch (tile.type) {
    case 'metric':
      return <MetricTile tile={tile} />;
    case 'trend':
      return <TrendTile tile={tile} />;
    case 'list':
      return <ListTile tile={tile} theme={theme} />;
    case 'segments':
      return <SegmentsTile tile={tile} />;
    case 'revenue':
      return <RevenueTile tile={tile} theme={theme} />;
    case 'staff':
      return <StaffTile tile={tile} theme={theme} />;
    case 'prescriptions':
      return <PrescriptionsTile tile={tile} theme={theme} />;
    default:
      return null;
  }
}

const DashboardTile = ({ tile }) => {
  const Icon = iconMap[tile.icon] || Activity;
  const theme = useTheme();

  return (
    <Tile $cols={tile.cols} $minHeight={tile.minHeight}>
      <TileHeader>
        <TileTitleWrap>
          <TileTitle>{tile.title}</TileTitle>
          <TileSubtitle>{tile.subtitle}</TileSubtitle>
        </TileTitleWrap>
        <IconBadge>
          <Icon size={20} />
        </IconBadge>
      </TileHeader>
      <TileBody tile={tile} theme={theme} />
    </Tile>
  );
};

const BentoDashboard = ({ config }) => {
  const { hero, topStats, tiles } = config;

  return (
    <DashboardShell>
      <HeroCard>
        <HeroPanel>
          <HeroKicker>{hero.kicker}</HeroKicker>
          <HeroTitle>{hero.title}</HeroTitle>
          <HeroText>{hero.description}</HeroText>
          <HeroPills>
            {hero.highlights.map((item) => (
              <HeroPill key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </HeroPill>
            ))}
          </HeroPills>
        </HeroPanel>

        <HeroSidebar>
          {topStats.map((item) => (
            <MiniPanel key={item.label}>
              <MiniLabel>{item.label}</MiniLabel>
              <MiniValue>{item.value}</MiniValue>
              <MiniHint>{item.hint}</MiniHint>
            </MiniPanel>
          ))}
        </HeroSidebar>
      </HeroCard>

      <Grid>
        {tiles.map((tile) => (
          <DashboardTile key={tile.id} tile={tile} />
        ))}
      </Grid>
    </DashboardShell>
  );
};

export default BentoDashboard;
