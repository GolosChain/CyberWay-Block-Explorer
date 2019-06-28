import React, { PureComponent, createRef, RefObject } from 'react';
import styled from 'styled-components';
import ChartJs from 'chart.js';
// @ts-ignore
import ToastsManager from 'toasts-manager';

const Wrapper = styled.div`
  width: 220px;
  height: 120px;
`;

type Props = {
  method: string;
  loadData: Function;
};

export default class Chart extends PureComponent<Props> {
  private canvasRef: RefObject<HTMLCanvasElement> = createRef();
  private chart: ChartJs | undefined;
  private updateTimeout: number | undefined;
  private interval: number | undefined;
  private lastUpdateTs: number | undefined;

  componentDidMount() {
    this.loadData();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  componentWillUnmount() {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.stopUpdateInterval();
  }

  private async loadData() {
    const { method, loadData } = this.props;

    try {
      const results = await loadData({ method });

      if (this.lastUpdateTs && document.hidden) {
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
    from,
    to,
    interval,
  }: {
    series: number[];
    from: string;
    to: string;
    interval: number;
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
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: 'Transactions/minute (last hour)',
        },
        legend: {
          display: false,
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
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
  }

  formatLabels(length: number, { to, interval }: { to: string; interval: number }) {
    const labels = [];

    const startTs = new Date(to).getTime();

    for (let currentTs = startTs; labels.length < length; currentTs - interval * 1000) {
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
    return (
      <Wrapper>
        <canvas width="220" height="120" ref={this.canvasRef} />
      </Wrapper>
    );
  }
}
