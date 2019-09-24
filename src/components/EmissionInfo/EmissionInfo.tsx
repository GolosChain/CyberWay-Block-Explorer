import React, { PureComponent, createRef, RefObject } from 'react';
import styled from 'styled-components';
import ChartJs from 'chart.js';
import { formatCyber } from '../../utils/cyberway';

const BLOCKS_PER_YEAR = (365 * 24 * 60 * 60) / 3;
const EMISSION_MIN_VOTED = 25;
const EMISSION_MAX_VOTED = 75;
const COLORS = {
  blue: 'rgb(54, 162, 235)',
  green: 'rgb(75, 192, 192)',
  grey: 'rgb(201, 203, 207)',
  orange: 'rgb(255, 159, 64)',
  purple: 'rgb(153, 102, 255)',
  red: 'rgb(255, 99, 132)',
  yellow: 'rgb(255, 205, 86)',
};

type Props = {
  supply: number;
  staked: number;
  voted: number;
};

type State = {
  votedPct: number;
  emission: number;
};

const Wrapper = styled.div`
  display: flex;
`;

const Info = styled.div`
  width: 260px;
  height: 100px;
`;

const TextInfo = styled(Info)`
  width: 320px;
  min-width: 320px;
`;

export default class EmissionInfo extends PureComponent<Props, State> {
  state = {
    votedPct: 0,
    emission: 20,
  };

  private pieCanvasRef: RefObject<HTMLCanvasElement> = createRef();
  private graphCanvasRef: RefObject<HTMLCanvasElement> = createRef();
  private pie: ChartJs | undefined;
  private graph: ChartJs | undefined;

  componentDidMount() {
    this.createCharts();
  }

  componentDidUpdate() {
    this.createCharts();
  }

  private createCharts() {
    if (this.props.supply) {
      this.createPie();
      this.createGraph();
    }
  }

  private createPie() {
    const { supply, staked, voted } = this.props;
    const notStaked = supply - staked;
    const notVoted = staked - voted;
    const colors = [COLORS.orange, COLORS.green, COLORS.red, COLORS.blue];

    if (this.pie) {
      this.pie.destroy();
    }

    this.pie = new ChartJs(this.pieCanvasRef.current as any, {
      type: 'pie',
      data: {
        datasets: [
          {
            data: [0, voted, notVoted, notStaked],
            backgroundColor: colors,
          },
          {
            data: [staked, 0, 0, notStaked],
            backgroundColor: colors,
          },
        ],
        labels: ['Staked', 'Voted', 'Not voted', 'Not staked'],
      },
      options: {
        legend: { display: false },
        tooltips: {
          callbacks: {
            label: (item: any, data: any) => {
              const idx = item.index;
              const ds = data.datasets[item.datasetIndex].data;
              const total = ds.reduce((previous: number, current: number) => {
                return Number(previous) + Number(current);
              });
              const value = ds[idx];
              const pct = ((100 * value) / total).toFixed(2);
              const label = data.labels[idx];
              return [(label ? label + ': ' : '') + pct + '%', formatCyber(value)];
            },
          },
        },
        responsive: true,
      },
    });
  }

  private createGraph() {
    const { votedPct, emission } = this.state;

    if (this.graph) {
      this.graph.destroy();
    }

    this.graph = new ChartJs(this.graphCanvasRef.current as any, {
      type: 'scatter',
      data: {
        datasets: [
          {
            backgroundColor: COLORS.red,
            borderColor: COLORS.red,
            data: [{ x: votedPct, y: emission }],
            pointStyle: 'rectRot',
            pointRadius: 5,
            pointHoverRadius: 6,
          },
          {
            data: [{ x: 0, y: 20 }, { x: 25, y: 20 }, { x: 75, y: 10 }, { x: 100, y: 10 }],
            fill: false,
            showLine: true,
            backgroundColor: COLORS.blue,
            borderColor: COLORS.blue,
          },
        ],
      },
      options: {
        responsive: true,
        elements: {
          line: {
            tension: 0, // disables bezier curves
          },
        },
        legend: {
          display: false,
        },
        tooltips: {
          callbacks: {
            label: (item: any, data: any) => {
              return item.datasetIndex === 0
                ? `Current: ${votedPct.toFixed(2)}% voted ⇒ ${emission.toFixed(2)}% emission`
                : `Voted ${item.xLabel}% ⇒ emission: ${item.yLabel}%`;
            },
          },
        },
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Voted tokens %',
                lineHeight: 0.2,
                padding: { top: 0, bottom: 3 },
                fontSize: 11,
              },
              ticks: {
                fontSize: 10,
                stepSize: 25,
              },
            },
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Emission %',
              },
            },
          ],
        },
      },
    });
  }

  // from cyber.govern smart-contract:
  private calculateEmission(supply: number, votesSum: number) {
    const notInvolvedPct = (100 * (supply - votesSum)) / supply;
    const limited = Math.min(Math.max(notInvolvedPct, EMISSION_MIN_VOTED), EMISSION_MAX_VOTED);
    const arg = (100 * (limited - EMISSION_MIN_VOTED)) / (EMISSION_MAX_VOTED - EMISSION_MIN_VOTED);
    const emissionPerYearPct = (arg * 8.7) / 100 + 9.53;
    const emissionPerYear = (emissionPerYearPct * supply) / 100;
    return {
      emissionPerYearPct,
      emissionAnnual: 100 * (Math.exp(emissionPerYearPct / 100) - 1),
      emissionPerYear,
      emissionPerBlock: emissionPerYear / BLOCKS_PER_YEAR,
    };
  }

  render() {
    const { supply, staked, voted } = this.props;
    const emission = this.calculateEmission(supply, voted);

    this.setState({
      votedPct: (100 * voted) / supply,
      emission: emission.emissionAnnual,
    });

    return (
      <Wrapper>
        {staked ? (
          <>
            <TextInfo>
              <ul>
                <li>Current supply: {formatCyber(supply, true)}</li>
                <li>Total staked: {formatCyber(staked, true)}</li>
                <li>Total votes: {formatCyber(voted, true)}</li>
                <li>Current emission: {emission.emissionAnnual.toFixed(2)}%</li>
              </ul>
            </TextInfo>
            <Info>
              <canvas width="220" height="100" ref={this.pieCanvasRef} />
            </Info>
            <Info>
              <canvas width="220" height="100" ref={this.graphCanvasRef} />
            </Info>
          </>
        ) : null}
      </Wrapper>
    );
  }
}
