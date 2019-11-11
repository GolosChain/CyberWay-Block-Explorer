import React, { PureComponent, createRef, RefObject } from 'react';
import styled from 'styled-components';
import ChartJs from 'chart.js';
import ToastsManager from 'toasts-manager';
import AccountName from '../../components/AccountName';

const WIDTH = 264;
const HEIGHT = 120;

const Wrapper = styled.div`
  display: flex;
`;

const ChartWrapper = styled.div`
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
`;

const MissedWrapper = styled.div`
  max-width: ${WIDTH}px;
  max-height: ${HEIGHT}px;
  font-size: 14px;
  overflow: hidden;
  margin: 8px 0 0 8px;
`;

const MissedBlocks = styled.ul`
  margin-top: 6px;
`;

const MissedItem = styled.li`
  margin: 4px 0;
`;

type Counter = {
  [key: string]: number;
};

type Props = {
  method: string;
  loadData: Function;
};

type State = {
  skippers: Counter | null;
  producers: Counter | null;
};

export default class Chart extends PureComponent<Props, State> {
  private canvasRef: RefObject<HTMLCanvasElement> = createRef();
  private chart: ChartJs | undefined;
  private updateTimeout: number | undefined;
  private interval: number | undefined;
  private lastUpdateTs: number | undefined;
  private stopUpdates = false;

  state = {
    skippers: null,
    producers: null,
  };

  componentDidMount() {
    this.stopUpdates = false;
    this.loadData();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  componentWillUnmount() {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.lastUpdateTs = this.interval = 1; // force stop updates on unmount. TODO: it's not clear logic, rewrite
    this.stopUpdates = true;
    this.stopUpdateInterval();
  }

  private async loadData() {
    const { method, loadData } = this.props;

    try {
      const results = await loadData({ method });

      if (this.lastUpdateTs && this.stopUpdates) {
        return;
      }

      this.lastUpdateTs = Date.now();
      this.interval = (results.interval / 2) * 1000;
      this.startUpdateTimeout();

      this.createGraph(results);
    } catch (err) {
      console.error(err);
      ToastsManager.error(`Request failed: ${err.message}`);
    }
  }

  private startUpdateTimeout() {
    this.stopUpdateInterval();

    if (!this.interval || !this.lastUpdateTs) {
      return;
    }

    const wait = Math.max(0, this.interval - (Date.now() - this.lastUpdateTs));

    this.updateTimeout = setTimeout(this.onUpdateTimeout, wait);
  }

  private onUpdateTimeout = () => {
    this.updateTimeout = undefined;
    this.loadData();
  };

  private stopUpdateInterval() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = undefined;
    }
  }

  private createGraph({
    series,
    missed,
    from,
    to,
    interval,
    producers,
    skippers,
  }: {
    series: number[];
    missed: number[];
    from: string;
    to: string;
    interval: number;
    producers: Counter;
    skippers: Counter;
  }) {
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.formatLabels(series.length, { to, interval });

    this.chart = new ChartJs(this.canvasRef.current as any, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'tps',
            data: series,
            backgroundColor: 'rgba(24,144,255, 0.7)',
            borderWidth: 1,
            yAxisID: 'tps',
          },
          {
            label: 'missed blocks',
            data: missed,
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderWidth: 1,
            fill: false,
            yAxisID: 'miss',
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: 'Transactions/second (last hour)',
        },
        legend: {
          display: false,
        },
        scales: {
          yAxes: [
            {
              id: 'tps',
              position: 'left',
              ticks: { beginAtZero: true },
            },
            {
              id: 'miss',
              position: 'right',
              gridLines: { drawOnChartArea: false },
              ticks: { beginAtZero: true },
            },
          ],
          xAxes: [
            {
              display: false,
            },
          ],
        },
      },
    });

    this.setState({ skippers, producers });
  }

  formatLabels(length: number, { to, interval }: { to: string; interval: number }) {
    const labels = [];
    const startTs = new Date(to).getTime();

    for (let currentTs = startTs; labels.length < length; currentTs -= interval * 1000) {
      const date = new Date(currentTs);
      labels.push(date.toLocaleString());
    }

    return labels;
  }

  onVisibilityChange = () => {
    this.stopUpdateInterval();

    if (!document.hidden && this.lastUpdateTs) {
      this.startUpdateTimeout();
    }
  };

  render() {
    const { skippers, producers } = this.state;
    const safeSkippers: Counter = skippers || {};
    const safeProducers: Counter = producers || {};
    const names = Object.keys(safeSkippers);

    return (
      <Wrapper>
        <ChartWrapper>
          <canvas width={WIDTH} height={HEIGHT} ref={this.canvasRef} />
        </ChartWrapper>
        {names.length ? (
          <MissedWrapper>
            <h4>Missed Blocks:</h4>
            <MissedBlocks>
              {names.map(name => {
                const count = safeSkippers[name];
                const total = count + (safeProducers[name] || 0);

                return (
                  <MissedItem key={`missed-${name}`}>
                    <span>{'❗️'}</span>
                    <AccountName account={{ id: name }} addLink />: <b>{count}</b>,{' '}
                    {((count / total) * 100).toFixed(0)}% miss rate
                  </MissedItem>
                );
              })}
            </MissedBlocks>
          </MissedWrapper>
        ) : null}
      </Wrapper>
    );
  }
}
