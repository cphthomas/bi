// import { Form, Row, Col, FormControl } from 'react-bootstrap';
import { Form, Row, Col, FormControl, Button } from 'react-bootstrap';
// import { useState } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import 'handsontable/dist/handsontable.min.css';
import { mean, sqrt, variance, quantileSeq } from 'mathjs';
// import Toggle from './ToggleRenderProps';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import Container from 'react-bootstrap/Container';

import InputGroup from 'react-bootstrap/InputGroup';
import norminv from 'norminv';
// import { numberFormat4 } from './lib'; //ændrer til komma og pct + DKK
import { numberFormat4 } from './numbers'; //ændrer til komma og pct + DKK

// import 'katex/dist/katex.min.css';
// import { InlineMath, BlockMath } from 'react-katex';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import bellcurve from 'highcharts/modules/histogram-bellcurve';
import HC_more from 'highcharts/highcharts-more';

import { MathJax, MathJaxContext } from 'better-react-mathjax';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import regression from 'regression';

require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/annotations')(Highcharts);

// var cdf = require('@stdlib/stats-base-dists-normal-cdf');
// var pdf = require('@stdlib/stats/base/dists/normal/pdf');
// var quantile = require('@stdlib/stats/base/dists/normal/quantile');
var cdft = require('@stdlib/stats/base/dists/t/cdf');
var pdft = require('@stdlib/stats/base/dists/t/pdf');
var quantilet = require('@stdlib/stats/base/dists/t/quantile');
var cdfchi = require('@stdlib/stats-base-dists-chisquare-cdf');
var quantilechi = require('@stdlib/stats/base/dists/chisquare/quantile');

var skewness = require('compute-skewness');
var kurtosis = require('compute-kurtosis');

const handsOnData = [['Kopier rådata ind her']];
// const qqdata0 = [
//   [-1.4652337926855228, 8],
//   [-0.7916386077433747, 10],
//   [-0.3661063568005697, 11],
//   [0, 12],
//   [0.3661063568005698, 14],
//   [0.7916386077433748, 15],
//   [1.4652337926855228, 16],
// ];
const hotSettings = {
  data: handsOnData,
  // colHeaders: true,
  // height: 'auto',
  minCols: 1,
  maxCols: 1,
  licenseKey: 'non-commercial-and-evaluation',
  copyPaste: true,
  contextMenu: true,
  colHeaders: ['Indsæt rådata herunder'],
  // colWidths: 400,
  // width: '100%',
  stretchH: 'all',
  width: 'auto',
  height: 220,
  // rowHeights: 23,
  rowHeaders: true,

  // hiddenColumns: { columns: [1] },
  language: 'en-US',
  type: 'numeric',
  numericFormat: { culture: 'de-DE', pattern: '0,00' },
  allowInvalid: false,
  allowEmpty: false,
  // columns: [{ hidden: true }, {}, {}],
};

const config = {
  loader: { load: ['[tex]/html'] },
  tex: {
    packages: { '[+]': ['html'] },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
  },
};

export default function Middel() {
  const hotTableComponent = useRef(null);
  const [Quant, setQuant] = useState(0);

  useEffect(() => {}, [hotTableComponent]);

  // const lastColumnOfTwoDArray = (arr, n) => arr.map((x) => x[n]);

  const afterDataLoaded = () => {
    // const y = lastColumnOfTwoDArray(handsOnData, 0);
    const y = [0];
    calculateQuant(y);
  };

  const afterUpdateCell = (changes, source) => {
    if (changes) {
      // let allData = [[]];
      // allData = hotTableComponent.current.hotInstance.getData();
      const y = hotTableComponent.current.hotInstance.getDataAtCol(0);
      calculateQuant(y);
    }
  };

  const calculateQuant = (y) => {
    // try {
    const ysorted = y.sort((a, b) => a - b);
    // const ypercentiles = y.map(function (num) {
    //   return (num - 0.5) / 10;
    // });
    const zscores = Array.from(Array(y.length), (_, i) => norminv((i + 0.5) / y.length, 0, 1));
    const qqdata = zscores.map(function (e, i) {
      return [e, ysorted[i]];
    });
    setQuant([
      mean(y),
      y.length,
      sqrt(variance(y)),
      skewness(y),
      y,
      kurtosis(y),
      qqdata,
      regression.linear(qqdata).predict(-3),
      regression.linear(qqdata).predict(3),
      true,
      +y.map((n) => +n),
    ]);

    // } catch (e) {
    //   console.error('Error:' + e);
    //   alert('Der er noget galt, tjek venligst rådata');
    // }
  };

  var [g, setg] = useState(+(50).toFixed(2)); //fraktiler
  var [showraw, setShowraw] = useState(true);
  var colordummyraw = showraw ? 'info' : 'warning';
  var [a, seta] = useState(+(10).toFixed(2)); //middelværdi
  if (showraw) a = Quant[0];
  var [b, setb] = useState(+50); //stikprøvestørrelse
  if (showraw) b = Quant[1];
  var [c, setc] = useState(+(10.5).toFixed(2)); //test middel
  var [e, sete] = useState(+(2.2).toFixed(2)); //test standardafvigelse
  var [std, setstd] = useState(+(2).toFixed(2)); //standardafvigelse
  if (showraw) std = Quant[2];
  var [f, setf] = useState(+(b * 10).toFixed(2)); //
  var [sig, setsig] = useState(['5% signifikansniveau']);
  var sigSelect = (e) => {
    setsig(e);
  };

  // const [show, setShow] = useState(true);
  // var [show2, setShow2] = useState(false);
  // var colordummy2 = show2 ? 'danger' : 'primary';
  var [show3, setShow3] = useState(false);
  var colordummy3 = show3 ? 'danger' : 'primary';
  var [show4, setShow4] = useState(false);
  var colordummy4 = show4 ? 'danger' : 'primary';
  var [show5, setShow5] = useState(false);
  var colordummy5 = show5 ? 'danger' : 'primary';
  var [show6, setShow6] = useState(false);
  var colordummy6 = show6 ? 'danger' : 'primary';
  var [show7, setShow7] = useState(false);
  var colordummy7 = show7 ? 'danger' : 'primary';
  var [show8, setShow8] = useState(false);
  var colordummy8 = show8 ? 'danger' : 'primary';
  var [show9, setShow9] = useState(false);
  var colordummy9 = show9 ? 'danger' : 'primary';

  var significancelevel = 0.05;
  if (sig === '5% signifikansniveau') {
    significancelevel = 0.05;
  } else {
    if (sig === '10% signifikansniveau') {
      significancelevel = 0.1;
    } else {
      if (sig === '1% signifikansniveau') {
        significancelevel = 0.01;
      }
    }
  }

  var [fpctext, setfpctext] = useState('Sæt kendt endelig populationsstørrelse');
  const toggleDisplay = () => {
    if (fpctext === 'Sæt kendt endelig populationsstørrelse') {
      setfpctext('Fjern kendt endelig populationsstørrelse');
    } else {
      setfpctext('Sæt kendt endelig populationsstørrelse');
    }
  };
  var fpc = 1;
  fpctext === 'Sæt kendt endelig populationsstørrelse' ? (fpc = 1) : (fpc = +Math.sqrt((f - b) / (f - 1)));
  var colordummyfpc =
    fpctext === 'Sæt kendt endelig populationsstørrelse' ? 'btn btn-primary btn-sm' : 'btn btn-danger btn-sm';
  var stdev = (std / Math.sqrt(b)) * fpc; //SEM
  var percentile = quantilet(1 - significancelevel / 2, b - 1);
  var lower = +a - percentile * stdev;
  var upper = +a + percentile * stdev;
  // var forudsætning = b * p * (1 - p);
  var fejlmargin = (upper - lower) / 2;
  var [d, setd] = useState(+Math.floor(fejlmargin).toFixed(2));
  var ttest = (a - c) / stdev;
  var pv1ned = cdft(ttest, b - 1);
  var pv1op = 1 - cdft(ttest, b - 1);
  var pv2 = 2 * Math.min(+pv1ned, +pv1op);
  var factor = 1;
  var chitest = ((b - 1) * Math.pow(std, 2)) / Math.pow(e, 2);
  var chipvned = cdfchi(chitest, b - 1);
  var chipvop = 1 - cdfchi(chitest, b - 1);
  var chipv2 = 2 * Math.min(+chipvned, +chipvop);
  var lowersigma = Math.pow(((+b - 1) * Math.pow(+std, 2)) / quantilechi(1 - significancelevel / 2, b - 1), 0.5);
  var uppersigma = Math.pow(((+b - 1) * Math.pow(+std, 2)) / quantilechi(significancelevel / 2, b - 1), 0.5);

  Math.abs(ttest) < 5 ? (factor = 1) : (factor = Math.abs(ttest / 5));

  var minsample = ((std * norminv(1 - significancelevel / 2, 0, 1)) / d) ** 2 * fpc;
  var N = 500;
  var x = [...Array(N + 1).keys()].map((i) => (factor * (i - N / 2)) / 50);
  var y = x.map((x) => pdft(x, b - 1));
  var coordinates = x.map(function (v, i) {
    return [v, y[i]];
  });
  var qop = quantilet(1 - significancelevel, b - 1);
  var qned = quantilet(significancelevel, b - 1);
  var q2 = quantilet(1 - significancelevel / 2, b - 1);

  var xciop = x.filter(function (x) {
    return x > qop;
  });
  xciop.unshift(qop, qop);
  xciop.sort((a, b) => a - b);
  var yciop = xciop.map((xciop) => pdft(xciop, b - 1));
  yciop[0] = +0;
  var coordinatesciop = xciop.map(function (v, i) {
    return [v, yciop[i]];
  });

  var xcined = x.filter(function (x) {
    return x < qned;
  });
  xcined.push(qned);
  var ycined = xcined.map((xcined) => pdft(xcined, b - 1));
  xcined.push(qned);
  ycined.push(0);
  var coordinatescined = xcined.map(function (v, i) {
    return [v, ycined[i]];
  });

  var xci2op = x.filter(function (x) {
    return x > q2;
  });
  xci2op.unshift(q2, q2);
  xci2op.sort((a, b) => a - b);
  var yci2op = xci2op.map((xci2op) => pdft(xci2op, b - 1));
  yci2op[0] = +0;
  var coordinatesci2op = xci2op.map(function (v, i) {
    return [v, yci2op[i]];
  });

  var xci2ned = x.filter(function (x) {
    return x < -q2;
  });
  xci2ned.push(-q2);
  var yci2ned = xci2ned.map((xci2ned) => pdft(xci2ned, b - 1));
  xci2ned.push(-q2);
  yci2ned.push(0);
  var coordinatesci2ned = xci2ned.map(function (v, i) {
    return [v, yci2ned[i]];
  });

  var xned = x.filter(function (x) {
    return x < ttest;
  });
  xned.push(ttest);
  var yned = xned.map((xned) => pdft(xned, b - 1));
  xned.push(ttest);
  yned.push(0);
  // var coordinatesned = xned.map(function (v, i) {
  //   return [v, yned[i]];
  // });

  var xop = x.filter(function (x) {
    return x > ttest;
  });
  xop.unshift(ttest);
  var yop = xop.map((xop) => pdft(xop, b - 1));
  xop.unshift(ttest);
  xop.push(5);
  yop.unshift(0);
  yop.push(0);

  const optionsop = {
    yAxis: [
      {
        // // Primary yAxis
        // labels: {
        //   format: '{value}',
        // },
        title: {
          text: 'Sandsynlighed',
          style: {
            color: Highcharts.getOptions().colors[1],
          },
        },
      },
    ],
    title: {
      text: 't-fordelingen et-sidet alternativ hypotese op',
    },
    subtitle: {
      useHTML: true,
      text: 'H<sub>0</sub>:&mu;≤' + c + '%   |  H<sub>1</sub>:&mu;>' + c + '%',
    },
    annotations: [
      {
        labelOptions: {
          // backgroundColor: "rgba(255,255,255,1)",
          // backgroundColor: "rgba(252, 255, 197, 1)",
          verticalAlign: 'top',
          padding: 2,

          style: {
            fontSize: '0.6em',
          },
        },
        labels: [
          {
            point: {
              xAxis: 0,
              yAxis: 0,
              x: ttest,
              y: 0.45,
            },
            text:
              +pv1op <= significancelevel
                ? 't-teststørrelsen er ' +
                  numberFormat4(ttest) +
                  '<br/>Forkast nulhypotesen' +
                  '<br/>P-værdien er ' +
                  numberFormat4(pv1op * 100) +
                  '%'
                : 't-teststørrelsen er ' +
                  numberFormat4(ttest) +
                  '<br/>Forkast IKKE nulhypotesen' +
                  '<br/>P-værdien er ' +
                  numberFormat4(pv1op * 100) +
                  '%',
            borderWidth: 1,
            borderColor: +pv1op <= significancelevel ? 'red' : 'green',
            backgroundColor: +pv1op <= significancelevel ? 'red' : 'green',
            style: { color: 'white' },
          },
          {
            distance: 10,
            point: {
              xAxis: 0,
              yAxis: 0,
              x: qop,
              y: pdft(qop, b - 1),
            },
            text:
              'Kritisk værdi ' +
              numberFormat4(qop) +
              '<br />Det røde hale areal er ' +
              numberFormat4(significancelevel * 100) +
              '%<br />dvs. signifikansniveauet',
            borderWidth: 1,
            borderColor: 'red',
            backgroundColor: 'red',
            style: { color: 'white' },
          },
        ],
      },
    ],
    chart: {
      type: 'spline',
    },

    credits: {
      enabled: false,
    },
    series: [
      {
        // color: 'blue',
        name: 'Forkast ikke',
        data: coordinates,
        color: 'green',
      },
      // {
      //   name: 'p-værdi',
      //   type: 'spline',
      //   data: coordinatesned,
      //   color: 'black',
      // },
      {
        name: 'Forkast',
        type: 'spline',
        data: coordinatesciop,
        color: 'rgb(255,0,0,1)',
      },
      {
        type: 'line',
        useHTML: true,
        color: +pv1op <= significancelevel ? 'red' : 'green',
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
        },
        name: 't-teststørrelse',
        data: [
          [ttest, 0],
          [ttest, 0.45],
        ],
      },
    ],
  };

  const optionsned = {
    yAxis: [
      {
        // // Primary yAxis
        // labels: {
        //   format: '{value}',
        // },
        title: {
          text: 'Sandsynlighed',
          style: {
            color: Highcharts.getOptions().colors[1],
          },
        },
      },
    ],
    title: {
      text: 't-fordelingen et-sidet alternativ hypotese ned',
    },
    subtitle: {
      useHTML: true,
      text: 'H<sub>0</sub>:&mu;≥' + c + '%   |  H<sub>1</sub>:&mu;<' + c + '%',
    },
    annotations: [
      {
        labelOptions: {
          // backgroundColor: "rgba(255,255,255,1)",
          // backgroundColor: "rgba(252, 255, 197, 1)",
          verticalAlign: 'top',
          padding: 2,

          style: {
            fontSize: '0.6em',
          },
        },
        labels: [
          {
            point: {
              xAxis: 0,
              yAxis: 0,
              x: ttest,
              y: 0.45,
            },
            text:
              +pv1ned <= significancelevel
                ? 't-teststørrelsen er ' +
                  numberFormat4(ttest) +
                  '<br/>Forkast nulhypotesen' +
                  '<br/>P-værdien er ' +
                  numberFormat4(pv1ned * 100) +
                  '%'
                : 't-teststørrelsen er ' +
                  numberFormat4(ttest) +
                  '<br/>Forkast IKKE nulhypotesen' +
                  '<br/>P-værdien er ' +
                  numberFormat4(pv1ned * 100) +
                  '%',
            borderWidth: 1,
            borderColor: +pv1ned <= significancelevel ? 'red' : 'green',
            backgroundColor: +pv1ned <= significancelevel ? 'red' : 'green',
            style: { color: 'white' },
          },
          {
            distance: 10,
            point: {
              xAxis: 0,
              yAxis: 0,
              x: qned,
              y: pdft(qned, b - 1),
            },
            text:
              'Kritisk værdi ' +
              numberFormat4(qned) +
              '<br />Det røde hale areal er ' +
              numberFormat4(significancelevel * 100) +
              '%<br />dvs. signifikansniveauet',
            borderWidth: 1,
            borderColor: 'red',
            backgroundColor: 'red',
            style: { color: 'white' },
          },
        ],
      },
    ],
    chart: {
      type: 'spline',
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        // color: 'blue',
        name: 'Forkast ikke',
        data: coordinates,
        color: 'green',
      },
      {
        type: 'line',
        useHTML: true,
        color: +pv1ned <= significancelevel ? 'red' : 'green',
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
        },
        name: 't-teststørrelse',
        data: [
          [ttest, 0],
          [ttest, 0.45],
        ],
      },
      // {
      //   name: 'p-værdi',
      //   type: 'spline',
      //   data: coordinatesop,
      //   color: 'black',
      // },
      {
        name: 'Forkast',
        type: 'spline',
        data: coordinatescined,
        color: 'rgb(255,0,0,1)',
      },
    ],
  };

  const options2 = {
    annotations: [
      {
        labelOptions: {
          // backgroundColor: "rgba(255,255,255,1)",
          // backgroundColor: "rgba(252, 255, 197, 1)",
          verticalAlign: 'top',
          padding: 2,

          style: {
            fontSize: '0.6em',
          },
        },

        labels: [
          {
            point: {
              xAxis: 0,
              yAxis: 0,
              x: ttest,
              y: 0.45,
            },
            text:
              +pv2 <= significancelevel
                ? 't-teststørrelsen er ' +
                  numberFormat4(ttest) +
                  '<br/>Forkast nulhypotesen' +
                  '<br/>P-værdien er ' +
                  numberFormat4(pv2 * 100) +
                  '%'
                : 't-teststørrelsen er ' +
                  numberFormat4(ttest) +
                  '<br/>Forkast IKKE nulhypotesen' +
                  '<br/>P-værdien er ' +
                  numberFormat4(pv2 * 100) +
                  '%',
            borderWidth: 1,
            borderColor: +pv2 <= significancelevel ? 'red' : 'green',
            backgroundColor: +pv2 <= significancelevel ? 'red' : 'green',
            style: { color: 'white' },
          },
          {
            distance: 10,
            point: {
              // verticalAlign: 'right',
              xAxis: 0,
              yAxis: 0,
              x: q2,
              y: pdft(q2, b - 1),
            },
            text:
              'Kritisk værdi ' +
              numberFormat4(q2) +
              '<br />Højre røde hale areal er ' +
              numberFormat4(significancelevel * 50) +
              '%<br />dvs. halvdelen af signifikansniveauet',
            borderWidth: 1,
            borderColor: 'red',
            backgroundColor: 'red',
            style: { color: 'white' },
          },

          {
            distance: 10,
            point: {
              xAxis: 0,
              yAxis: 0,
              x: -q2,
              y: pdft(-q2, b - 1),
            },
            text:
              'Kritisk værdi ' +
              numberFormat4(-q2) +
              '<br />Venstre røde hale areal er ' +
              numberFormat4(significancelevel * 50) +
              '%<br />dvs. halvdelen af signifikansniveauet',
            borderWidth: 1,
            borderColor: 'red',
            backgroundColor: 'red',
            style: { color: 'white' },
          },
        ],
      },
    ],
    yAxis: [
      {
        // // Primary yAxis
        // labels: {
        //   format: '{value}',
        // },
        title: {
          text: 'Sandsynlighed',
          style: {
            color: Highcharts.getOptions().colors[1],
          },
        },
      },
    ],
    chart: {
      type: 'spline',
    },
    title: {
      text: 't-fordelingen 2-sidet alternativ hypotese',
    },
    subtitle: {
      useHTML: true,
      text: 'H<sub>0</sub>:&mu;=' + c + '%   |  H<sub>1</sub>:&mu;≠' + c + '%',
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        // color: 'blue',
        name: 'Forkast ikke',
        data: coordinates,
        color: 'green',
      },
      {
        type: 'line',
        useHTML: true,
        color: +pv2 <= significancelevel ? 'red' : 'green',
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
        },
        name: 't-teststørrelse',
        data: [
          [-ttest, 0],
          [-ttest, pdft(ttest, b - 1)],
        ],
      },
      {
        type: 'line',
        useHTML: true,
        color: +pv2 <= significancelevel ? 'red' : 'green',
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
        },
        name: 't-teststørrelse',
        data: [
          [ttest, 0],
          [ttest, 0.45],
        ],
      },
      // {
      //   name: 'p-værdi',
      //   type: 'spline',
      //   data: coordinatesop2,
      //   color: 'black',
      // },
      // {
      //   name: 'p-værdi',
      //   type: 'spline',
      //   data: coordinatesned2,
      //   color: 'black',
      // },
      {
        name: 'Forkast',
        type: 'spline',
        data: coordinatesci2op,
        color: 'rgb(255,0,0,1)',
      },
      {
        name: 'Forkast',
        type: 'spline',
        data: coordinatesci2ned,
        color: 'rgb(255,0,0,1)',
      },
    ],
  };

  const qqp = {
    yAxis: [
      {
        visible: true,
        title: {
          text: 'Stikprøve fraktiler',
          style: {
            color: Highcharts.getOptions().colors[1],
          },
        },
      },
    ],
    xAxis: [
      {
        plotLines: [
          {
            color: 'lightgrey',
            width: 1,
            value: 0,
          },
        ],

        visible: true,
        title: {
          text: 'Teoretiske fraktiler',
          style: {
            color: Highcharts.getOptions().colors[1],
          },
        },
      },
    ],
    title: {
      text: 'Normalfraktildiagram',
    },

    chart: {
      type: 'scatter',
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        // color: 'blue',
        name: 'QQ-plot',
        data: Quant[6],
        color: 'blue',
      },
      {
        type: 'line',
        color: 'red',
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
        },
        name: 'Perfekt linje',
        data: [Quant[7], Quant[8]],
      },
    ],
  };
  bellcurve(Highcharts);

  // function histogram(X, binRange) {
  //   //inclusive of the first number
  //   var max = Math.max(...X);
  //   var min = Math.min(...X);
  //   var len = max - min + 1;
  //   var numberOfBins = Math.ceil(len / binRange);
  //   var bins = new Array(numberOfBins).fill(0);
  //   //-min to normalise values for the array
  //   X.forEach((x) => bins[Math.floor((x - min) / binRange)]++);
  //   return bins;
  // }

  var histp = {
    title: {
      text: 'Histogram ',
    },
    credits: {
      enabled: false,
    },
    xAxis: [
      {
        title: { text: '' },
        alignTicks: true,
      },
      {
        title: { text: '' },
        alignTicks: false,
        opposite: false,
      },
    ],

    yAxis: [
      {
        title: { text: 'Antal observationer' },
        alignTicks: false,
        opposite: false,
      },
      {
        title: { text: '' },
        alignTicks: false,
        opposite: false,
        visible: false,
      },
    ],

    plotOptions: {
      histogram: {
        accessibility: {
          point: {
            valueDescriptionFormat: '{index}. {point.x:.3f} to {point.x2:.3f}, {point.y}.',
          },
        },
      },
    },

    series: [
      {
        name: 'Observerede værdier',
        type: 'histogram',
        xAxis: 1,
        yAxis: 0,
        baseSeries: 's1',
        visible: true,
        zIndex: -1,
      },
      {
        name: 'normal(&mu; = ' + numberFormat4(Quant[0]) + ' ; &sigma; = ' + numberFormat4(Quant[2]) + ')',
        type: 'bellcurve',
        xAxis: 1,
        yAxis: 1,
        baseSeries: 's2',
        zIndex: -1,
        // color: 'rgba(100, 100, 100, 0.9)',
        fillOpacity: 0.2,
        opacity: 0.3,
      },

      {
        name: '',
        type: 'scatter',
        data: Quant[4],
        id: 's1',
        visible: false,
        marker: {
          radius: 0.01,
        },
      },
      {
        name: '',
        type: 'scatter',
        data: Quant[4],
        id: 's2',
        visible: false,
        marker: {
          radius: 0.01,
        },
      },
    ],
  };

  HC_more(Highcharts);
  const boxp = {
    credits: {
      enabled: false,
    },
    chart: {
      type: 'boxplot',
    },
    title: {
      text: 'Boksplot',
    },
    legend: {
      enabled: false,
    },
    xAxis: {
      title: {
        text: 'Boksplot',
      },
    },

    series: [
      {
        name: Quant[9] && quantileSeq(Quant[4], 50 / 100) > Quant[2] ? '' : '',
        data: [
          [
            Quant[9] && quantileSeq(Quant[4], 0 / 100),
            Quant[9] && quantileSeq(Quant[4], 25 / 100),
            Quant[9] && quantileSeq(Quant[4], 50 / 100),
            Quant[9] && quantileSeq(Quant[4], 75 / 100),
            Quant[9] && quantileSeq(Quant[4], 100 / 100),
          ],
        ],
        tooltip: {
          headerFormat:
            Quant[9] && quantileSeq(Quant[4], 50 / 100) > Quant[2]
              ? Quant[9] &&
                'Middelværdien (rød linje) er ' +
                  numberFormat4(Quant[2]) +
                  '<br/>er mindre end medianen som er ' +
                  numberFormat4(quantileSeq(Quant[4], 50 / 100)) +
                  ' (miderste blå linje),<br/>dette indikerer venstreskævhed<br/>Vi ser at skævheden er ' +
                  numberFormat4(Quant[5]) +
                  '<br/>'
              : Quant[9] &&
                'Middelværdien (rød linje) er ' +
                  numberFormat4(Quant[2]) +
                  '<br/>er større end medianen ' +
                  numberFormat4(quantileSeq(Quant[4], 50 / 100)) +
                  ',<br/>dette indikerer højreskævhed<br/>Vi ser at skævheden er ' +
                  numberFormat4(Quant[5]) +
                  '<br/>',
          color: 'red',
        },
      },
    ],

    yAxis: {
      title: {
        text: 'Observationer',
      },
      plotLines: [
        {
          value: Quant[2],
          color: 'red',
          width: 2,
        },
      ],
    },
  };

  // return##############################################################################################################################
  // ##############################################################################################################################
  // ##############################################################################################################################
  return (
    <>
      <MathJaxContext hideUntilTypeset={'first'} config={config} version={3}>
        <Container className="p-0">
          <div class="p-3 mb-2 bg-white text-black">
            <div class="card">
              <Container>
                <div class="p-3 mb-2 bg-white">
                  <Form>
                    <span class="lead text-muted">
                      1 Kvantitativ stikprøve{' '}
                      <OverlayTrigger
                        placement="auto"
                        overlay={
                          <Tooltip>
                            <p style={{ textAlign: 'left' }}>
                              Når vi har en kvantitativ variabel, kan vi både teste middelværdi og standardafvigelse.
                              <br></br>
                              En kvantitativ variabel kan fx. være højde, indkomst, alder, indlånsrente, skattegæld etc.
                              Man kan tænke på en kvantitativ variabel som en variabel som man kan regne på, for at
                              finde gennemsnit, standardafvigelse, median etc.
                            </p>
                          </Tooltip>
                        }
                      >
                        <i class="fas fa-question-circle"></i>
                      </OverlayTrigger>
                    </span>
                    <p class="lead text-muted">
                      Analyse af en kvantitativ variabel, tests af middel og standardafvigelse<br></br>
                    </p>
                    <Row>
                      <Col class="col-6">
                        <Button variant={colordummyraw} size="sm" onClick={() => setShowraw(!showraw)}>
                          {showraw && 'Indsæt beregnede data'}
                          {!showraw && 'Indsæt rådata'}
                        </Button>
                        {showraw && (
                          <Button variant="danger" size="sm" onClick={() => window.location.reload()}>
                            <span class="fas fa-trash"></span>&nbsp; Slet Rådata
                          </Button>
                        )}
                      </Col>
                      <Col></Col>
                    </Row>
                    <br></br>
                    {showraw && (
                      <>
                        <Row>
                          <Col>
                            <HotTable
                              ref={hotTableComponent}
                              settings={hotSettings}
                              afterChange={afterUpdateCell}
                              afterLoadData={afterDataLoaded}
                            />
                            <br></br>
                          </Col>

                          <Col></Col>
                        </Row>
                      </>
                    )}
                    {/* Signifikansniveau########################################################################################################################################################################################## */}
                    <Row>
                      <Col>
                        <InputGroup>
                          <div class="btndown">
                            <DropdownButton
                              size="sm"
                              // alignleft
                              // variant="warning"
                              title={sig}
                              id="sig"
                              // id="dropdown-split-basic"
                              onSelect={sigSelect}
                            >
                              <Dropdown.Item eventKey="1% signifikansniveau">
                                <p test />
                                1% signifikansniveau
                              </Dropdown.Item>
                              <Dropdown.Item btn-sm eventKey="5% signifikansniveau">
                                5% signifikansniveau
                              </Dropdown.Item>
                              <Dropdown.Item eventKey="10% signifikansniveau">10% signifikansniveau</Dropdown.Item>
                            </DropdownButton>
                          </div>
                        </InputGroup>
                      </Col>
                    </Row>
                    <br></br>
                    {/* Alert størrelsen########################################################################################################################################################################################################################### */}
                    <Row>
                      <Col>
                        {+b < 30 && +b > 1 && (
                          <div class="alert alert-warning">
                            <strong>Bemærk!</strong> Stikprøven er mindre end 30 observationer, det er derfor en
                            forudsætning at stikprøven stammer fra en normalfordelt population, denne forudsætning kan
                            undersøges med fx. et normalfraktildiagram.{' '}
                            {!showraw && 'Da vi ikke har rådata i dette tilfælde er et forudsætningscheck ikke muligt.'}
                          </div>
                        )}
                      </Col>
                    </Row>
                    {/* Stikprøvegennemsnittet og størrelsen########################################################################################################################################################################################################################### */}
                    {!showraw && (
                      <>
                        <Row>
                          <Col>
                            <Form.Text className="text-muted">Stikprøve-gennemsnittet</Form.Text>
                            <InputGroup size="sm">
                              <OverlayTrigger
                                placement="auto"
                                delay={{
                                  show: 100,
                                  hide: 100,
                                }}
                                overlay={
                                  <Tooltip>
                                    Gennemsnittet {a}, findes ved at lægge alle observationer sammen og dividere med
                                    antallet af observationer {b}.
                                  </Tooltip>
                                }
                              >
                                <FormControl
                                  type="number"
                                  // max="-0.000000001"
                                  step={1}
                                  precision={0}
                                  //mobile={true}
                                  value={+a}
                                  onChange={(e) => seta(e.target.value)}
                                  placeholder="0"
                                />
                              </OverlayTrigger>
                              {/* <InputGroup.Append>
													<InputGroup.Text
														inputGroup-sizing-sm
														id="basic-addon2"
													>
														Successer
													</InputGroup.Text>
												</InputGroup.Append> */}
                            </InputGroup>
                          </Col>
                          <br></br>
                          <Col>
                            <Form.Text className="text-muted">Stikprøvestørrelsen</Form.Text>
                            <InputGroup size="sm">
                              <OverlayTrigger
                                placement="auto"
                                delay={{
                                  show: 100,
                                  hide: 100,
                                }}
                                overlay={
                                  <Tooltip>
                                    <MathJax>
                                      Stikprøvestørrelsen <span>{`$n$`}</span> er antallet af observationer i
                                      stikprøven.
                                    </MathJax>
                                  </Tooltip>
                                }
                              >
                                <FormControl
                                  type="number"
                                  // max="-0.000000001"
                                  step={1}
                                  precision={0}
                                  //mobile={true}
                                  value={+b}
                                  onChange={(e) => setb(e.target.value)}
                                  placeholder="0"
                                />
                              </OverlayTrigger>
                            </InputGroup>
                          </Col>
                        </Row>
                        {/*  stikprøvestd########################################################################################################################################################################################################################### */}
                        <Row>
                          <br></br>
                          <Col>
                            <Form.Text className="text-muted">Standardafvigelsen</Form.Text>
                            <InputGroup size="sm">
                              <OverlayTrigger
                                placement="auto"
                                delay={{
                                  show: 100,
                                  hide: 100,
                                }}
                                overlay={
                                  <Tooltip>
                                    Standardafvigelsen for stikprøven er her {std}, dette er et mål for variationen.
                                    Populært kan vi sige at standardafvigelsen er den typiske afvigelse fra
                                    gennemsnittet. Vi kender ikke den sande standardafvigelse &sigma; for populationen,
                                    men standardafvigelsen for stikprøven er vort bedste bud på standardafvigelsen i
                                    populationen. Standardafvigelsen findes som kvadratroden af summen af de kvadrerede
                                    afvigelser divideret med antallet af observationer {b}.
                                  </Tooltip>
                                }
                              >
                                <FormControl
                                  type="number"
                                  // max="-0.000000001"
                                  step={1}
                                  precision={0}
                                  //mobile={true}
                                  value={+std}
                                  onChange={(e) => setstd(e.target.value)}
                                  placeholder="0"
                                />
                              </OverlayTrigger>
                            </InputGroup>
                          </Col>
                          <Col></Col>
                        </Row>
                      </>
                    )}

                    <hr></hr>
                    {/* Punktestimat########################################################################################################################################################################################## */}
                    <Row>
                      <Col class="col-6">
                        <Button variant={colordummy3} size="sm" onClick={() => setShow3(!show3)}>
                          {show3 && 'Skjul Punktestimater'}
                          {!show3 && 'Punktestimater'}
                        </Button>
                        <div>
                          {show3 && (
                            <div>
                              <div>
                                <br></br>
                                <div class="card">
                                  <div class="card-body">
                                    <div></div>
                                    <p class="card-text">
                                      <MathJax dynamic>
                                        Vores bedste gæt på, også kaldet estimat for, den sande middelværdi i
                                        populationen er stikprøvegennemsnittet{' '}
                                        <span>{`$\\bar{x}=${numberFormat4(a)}$`}</span>. Dette estimat skrives{' '}
                                        <span>{`$\\hat{\\mu}$`}</span> og udtales <i>my hat</i>.<br></br>Den sande
                                        ukendte middelværdi i populationen betegnes <span>{`$\\mu$`}</span>, da vi
                                        estimerer, angiver vi dette med hat-symbolet over <span>{`$\\hat{\\mu}$`}</span>
                                        . Vi kalder også <span>{`$\\hat{\\mu}$`}</span> for punktestimatet.<br></br>
                                        Her har vi ikke de enkelte observationer, men kun de beregnede deskriptorer
                                        stikprøve -gennemsnit og -standardafvigelse. Havde vi rådata (hver af de {
                                          b
                                        }{' '}
                                        observationer), kunne vi bestemme punktestimatet som stikprøvegennemsnittet{' '}
                                        <span>{`$\\bar{x}$`}</span> med formlen herunder:
                                        <span>{`$$\\frac{\\sum_{i=1}^{n}{x_{i}}}{n} = \\frac{\\sum_{i=1}^{${b}}{x_{i}}}{${b}}=\\frac{x_{1}+...+x_{${b}}}{${b}}=${numberFormat4(
                                          a
                                        )}
                                          
                                        $$`}</span>
                                        <hr></hr>
                                        Vores bedste gæt på, også kaldet estimat for, den sande standardafvigelse i
                                        populationen er {numberFormat4(std)}. Dette estimat skrives{' '}
                                        <span>{`$\\hat{\\sigma}$`}</span> og udtales <i>sigma hat</i>.<br></br>Den sande
                                        ukendte standardafvigelse i populationen betegnes <span>{`$\\sigma$`}</span>, da
                                        vi estimerer, angiver vi dette med hat-symbolet over{' '}
                                        <span>{`$\\hat{\\sigma}$`}</span>. Vi kalder også{' '}
                                        <span>{`$\\hat{\\sigma}$`}</span> for punktestimatet.<br></br>
                                        Her har vi ikke de enkelte observationer, men kun de beregnede deskriptorer
                                        stikprøve -gennemsnit og -standardafvigelse. Havde vi rådata (hver af de {
                                          b
                                        }{' '}
                                        observationer), kunne vi bestemme estimatet ud fra stikprøve-standardafvigelsen{' '}
                                        <span>{`$\\hat{\\sigma}$`}</span> med formlen herunder:
                                        <span>{`$$\\sqrt{\\frac{\\sum_{i=1}^{n}{(x_{i}-\\bar{x})^2}}{n-1}} = \\sqrt{\\frac{\\sum_{i=1}^{${b}}{(x_{i}-\\bar{x})^2}}{${
                                          b - 1
                                        }}}=$$`}</span>
                                        <span>{`$$\\sqrt{ \\frac{(x_{1}-\\bar{x})^2+...+(x_{${b}}-\\bar{x})^2}{${
                                          b - 1
                                        }}}=${numberFormat4(std)}
                                          
                                        $$`}</span>
                                      </MathJax>
                                    </p>
                                  </div>
                                </div>
                                <br></br>
                              </div>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                    {/* Fraktiler######################################################################################################################################################### */}
                    {showraw && (
                      <Row>
                        <Col class="col-6">
                          <Button variant={colordummy9} size="sm" onClick={() => setShow9(!show9)}>
                            {show9 && 'Skjul Datafordeling'}
                            {!show9 && 'Datafordeling'}
                          </Button>
                          <div>
                            {show9 && (
                              <div>
                                <div>
                                  <br></br>
                                  <div class="card">
                                    <div class="card-body">
                                      <div></div>

                                      <p class="card-text">
                                        Skævheden angiver om fordelingen er venstre-, højreskæv eller symmetrisk, er
                                        skævheden væsentligt mindre end 0 er fordelingen venstreskæv, tilsvarende
                                        betyder skævhed større end 0 højreskævheden. Er skævheden tæt på 0 er betyder
                                        det fordelingen er symmetrisk. Her kan vi beregne skævheden til{' '}
                                        {numberFormat4(Quant[3])}, dette betyder fordelingen er{' '}
                                        {Quant[3] < -0.2 && 'venstreskæv.'}
                                        {Quant[3] > 0.2 && 'højreskæv.'}
                                        {Quant[3] <= 0.2 && Quant[3] >= -0.2 && 'nogenlunde symmetrisk.'} Formlen for
                                        skævheden er indviklet og udelades her.
                                        <hr></hr>
                                        Topstejlheden også kaldet kurtosis angiver om fordelingen er flad, spids eller
                                        klokkeformet, er kurtosis væsentligt mindre end 0 er fordelingen flad,
                                        tilsvarende betyder kurtosis større end 0 fordelingen er spids. Er kurtosis tæt
                                        på 0 er betyder det fordelingen er klokkeformet. Her kan vi beregne kurtosis til{' '}
                                        {numberFormat4(Quant[5])}, dette betyder fordelingen er{' '}
                                        {Quant[5] < -0.2 && 'flad.'}
                                        {Quant[5] > 0.2 && 'spids.'}
                                        {Quant[5] <= 0.2 && Quant[5] >= -0.2 && 'nogenlunde klokkeformet.'} Formlen for
                                        kurtosis er indviklet og udelades her.
                                        <hr></hr>
                                        <br />
                                        <HighchartsReact highcharts={Highcharts} options={histp} />
                                        <br />
                                        <HighchartsReact highcharts={Highcharts} options={qqp} />
                                        <br />
                                        <HighchartsReact highcharts={Highcharts} options={boxp} />
                                        <Row>
                                          {/*  fraktil knap########################################################################################################################################################################################################################### */}
                                          <Col>
                                            <Form.Text className="text-muted">Angiv fraktilen i %</Form.Text>
                                            <InputGroup size="sm">
                                              <OverlayTrigger
                                                placement="top"
                                                delay={{
                                                  show: 100,
                                                  hide: 100,
                                                }}
                                                overlay={
                                                  <Tooltip>
                                                    {g >= 0 && g <= 100 ? (
                                                      <>
                                                        {+numberFormat4(g)} %'s fraktilen er{' '}
                                                        {+numberFormat4(quantileSeq(Quant[4], g / 100))}
                                                      </>
                                                    ) : (
                                                      'Bemærk værdien skal være mellem 0% og 100%'
                                                    )}
                                                  </Tooltip>
                                                }
                                              >
                                                <FormControl
                                                  type="number"
                                                  min="0.00000000"
                                                  max="100"
                                                  step={1}
                                                  precision={0}
                                                  //mobile={true}
                                                  value={+g}
                                                  onChange={(e) => setg(e.target.value)}
                                                  placeholder="0"
                                                />
                                              </OverlayTrigger>
                                            </InputGroup>
                                          </Col>
                                          {/*  test standardafvigelsen knap########################################################################################################################################################################################################################### */}
                                          <Col></Col>
                                        </Row>
                                        <hr></hr>
                                        Fraktiler benyttes til at opdele det ordnede datasæt, for at skabe overblik over
                                        fordelingen af data.<br></br>
                                        <br></br>
                                        {g >= 0 && g <= 100 ? (
                                          <>
                                            <table class="table table-bordered">
                                              <thead className="text-muted">
                                                <tr>
                                                  <th scope="col">Fraktil</th>
                                                  <th scope="col">Værdi</th>
                                                  <th scope="col">Forklaring</th>
                                                </tr>
                                              </thead>
                                              <tbody className="text-muted">
                                                <tr>
                                                  <th scope="row"> {numberFormat4(g)}%</th>
                                                  <td>{numberFormat4(quantileSeq(Quant[4], g / 100))}</td>
                                                  <td>
                                                    {numberFormat4(g)}%'s fraktilen også kaldet {numberFormat4(g / 100)}{' '}
                                                    fraktilen er {numberFormat4(quantileSeq(Quant[4], g / 100))}.
                                                    <br></br>Det betyder {numberFormat4(g)}% af observationerne er
                                                    mindre end {numberFormat4(quantileSeq(Quant[4], g / 100))} eller at{' '}
                                                    {numberFormat4(100 - g)}% af observationerne er større end{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], g / 100))} .
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <th scope="row">0%</th>
                                                  <td>{numberFormat4(quantileSeq(Quant[4], 0 / 100))}</td>
                                                  <td>
                                                    0%'s fraktilen er {numberFormat4(quantileSeq(Quant[4], 0 / 100))}.
                                                    0%'s fraktilen er den mindste observation.
                                                    <br></br>Det betyder 0% af observationerne er mindre end{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 0 / 100))} eller at{' '}
                                                    {numberFormat4(100 - 0)}% af observationerne mindst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 0 / 100))}.
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <th scope="row">10%</th>
                                                  <td>{numberFormat4(quantileSeq(Quant[4], 10 / 100))}</td>
                                                  <td>
                                                    10%'s fraktilen er {numberFormat4(quantileSeq(Quant[4], 10 / 100))},
                                                    10%'s fraktilen kaldes også 1. decil.
                                                    <br></br>Det betyder 10% af observationerne højst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 10 / 100))} eller at{' '}
                                                    {numberFormat4(100 - 10)}% af observationerne mindst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 10 / 100))}.
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <th scope="row">20%</th>
                                                  <td>{numberFormat4(quantileSeq(Quant[4], 20 / 100))}</td>
                                                  <td>
                                                    20%'s fraktilen er {numberFormat4(quantileSeq(Quant[4], 20 / 100))},
                                                    20%'s fraktilen kaldes også 2. decil.
                                                    <br></br>Det betyder 20% af observationerne højst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 20 / 100))} eller at{' '}
                                                    {numberFormat4(100 - 20)}% af observationerne mindst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 20 / 100))}.
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <th scope="row">25%</th>
                                                  <td>{numberFormat4(quantileSeq(Quant[4], 25 / 100))}</td>
                                                  <td>
                                                    25%'s fraktilen er {numberFormat4(quantileSeq(Quant[4], 20 / 100))},
                                                    25%'s fraktilen kaldes også 1 kvartil.
                                                    <br></br>Det betyder 25% af observationerne højst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 25 / 100))} eller at{' '}
                                                    {numberFormat4(100 - 25)}% af observationerne mindst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 25 / 100))}.
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <th scope="row">50%</th>
                                                  <td>{numberFormat4(quantileSeq(Quant[4], 50 / 100))}</td>
                                                  <td>
                                                    50%'s fraktilen er {numberFormat4(quantileSeq(Quant[4], 50 / 100))},
                                                    50%'s fraktilen kaldes også medianen.
                                                    <br></br>Det betyder 50% af observationerne højst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 50 / 100))} eller at{' '}
                                                    {numberFormat4(100 - 50)}% af observationerne mindst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 50 / 100))}.
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <th scope="row">75%</th>
                                                  <td>{numberFormat4(quantileSeq(Quant[4], 75 / 100))}</td>
                                                  <td>
                                                    75%'s fraktilen er {numberFormat4(quantileSeq(Quant[4], 75 / 100))},
                                                    75%'s fraktilen kaldes også 1 kvartil.
                                                    <br></br>Det betyder 75% af observationerne højst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 75 / 100))} eller at{' '}
                                                    {numberFormat4(100 - 75)}% af observationerne mindst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 75 / 100))}.
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <th scope="row">90%</th>
                                                  <td>{numberFormat4(quantileSeq(Quant[4], 90 / 100))}</td>
                                                  <td>
                                                    90%'s fraktilen er {numberFormat4(quantileSeq(Quant[4], 90 / 100))},
                                                    90%'s fraktilen kaldes også 9. decil.
                                                    <br></br>Det betyder 90% af observationerne højst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 90 / 100))} eller at{' '}
                                                    {numberFormat4(100 - 90)}% af observationerne mindst er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 90 / 100))}.
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <th scope="row">100%</th>
                                                  <td>{numberFormat4(quantileSeq(Quant[4], 100 / 100))}</td>
                                                  <td>
                                                    {numberFormat4(100)}%'s fraktilen også kaldet{' '}
                                                    {numberFormat4(100 / 100)} fraktilen er{' '}
                                                    {numberFormat4(quantileSeq(Quant[4], 100 / 100))}.<br></br>Det
                                                    betyder {numberFormat4(100)}% af observationerne højst er{' '}
                                                    {quantileSeq(Quant[4], 100 / 100)} eller at{' '}
                                                    {numberFormat4(100 - 100)}% af observationerne er større end{' '}
                                                    {quantileSeq(Quant[4], 100 / 100)}.
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </>
                                        ) : (
                                          <div class="alert alert-warning">
                                            <strong>Bemærk!</strong> Fraktilen kan kun antage værdier mellem 0% og 100%,
                                            ret input i feltet ovenfor.
                                          </div>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <br></br>
                                </div>
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>
                    )}
                    {/* Konfidensinterval########################################################################################################################################################################################## */}
                    <Row>
                      <Col class="col-6">
                        <Button variant={colordummy6} size="sm" onClick={() => setShow6(!show6)}>
                          {show6 && 'Skjul Konfidensinterval'}
                          {!show6 && 'Konfidensinterval'}
                        </Button>
                        <div>
                          {show6 && (
                            <>
                              <div>
                                <br></br>
                                <div class="card">
                                  <div class="card-body">
                                    <div></div>
                                    <p class="card-text">
                                      <MathJax>
                                        Konfidensintervallet angiver, i hvilket interval den sande middelværdi i &mu;
                                        populationen ligger med en vis sandsynlighed.<br></br>
                                        Den nedre grænse for konfidensintervallet kan beregnes som{' '}
                                        {numberFormat4(lower)}, og den øvre grænse for konfidensintervallet kan beregnes
                                        som {numberFormat4(upper)}
                                        <br></br>
                                        Med {100 - significancelevel * 100}% sandsynlighed ligger den sande middelværdi
                                        i populationen, mellem{' '}
                                        <span style={{ backgroundColor: '#80ff00' }}>{numberFormat4(lower)}</span> og{' '}
                                        <span style={{ backgroundColor: '#80ff00' }}>{numberFormat4(upper)}</span>
                                        <hr></hr>
                                        Konfidensintervallet angiver, i hvilket interval den sande standardafvigelse i
                                        &sigma; populationen ligger med en vis sandsynlighed.<br></br>
                                        Den nedre grænse for konfidensintervallet kan beregnes som{' '}
                                        {numberFormat4(lowersigma)}, og den øvre grænse for konfidensintervallet kan
                                        beregnes som {numberFormat4(uppersigma)}
                                        <br></br>
                                        Med {100 - significancelevel * 100}% sandsynlighed ligger den sande
                                        standardafvigelse i populationen, mellem{' '}
                                        <span style={{ backgroundColor: '#80ff00' }}>{numberFormat4(lowersigma)}</span>{' '}
                                        og{' '}
                                        <span style={{ backgroundColor: '#80ff00' }}>{numberFormat4(uppersigma)}</span>
                                      </MathJax>
                                    </p>
                                  </div>
                                </div>
                                <br></br>
                              </div>
                            </>
                          )}
                        </div>
                      </Col>
                    </Row>
                    {/* ########################################################################################################################################################################################## */}
                    {/* Hypoteser Middelværdi*/}
                    <Row>
                      <Col class="col-6">
                        <Button variant={colordummy4} size="sm" onClick={() => setShow4(!show4)}>
                          {show4 && (
                            <span>
                              Skjul test middel <span style={{ color: 'white', textTransform: 'none' }}>&mu;</span>
                            </span>
                          )}
                          {!show4 && (
                            <span>
                              Test middel <span style={{ color: 'white', textTransform: 'none' }}>&mu;</span>
                            </span>
                          )}
                        </Button>

                        <div>
                          {show4 && (
                            <div>
                              <br></br>

                              <div class="card">
                                <div class="card-body">
                                  <Row>
                                    {/*  test middel knap########################################################################################################################################################################################################################### */}
                                    <Col>
                                      <Form.Text className="text-muted">Test af middelværdien &mu;</Form.Text>
                                      <InputGroup size="sm">
                                        <OverlayTrigger
                                          placement="auto"
                                          delay={{
                                            show: 100,
                                            hide: 100,
                                          }}
                                          overlay={
                                            <Tooltip>
                                              <MathJax>
                                                Man kan ved tests sammenligne middelværdien{' '}
                                                <span>{`$\\mu$ = ${c}`}</span> med stikprøve-gennemsnittet {a}.
                                              </MathJax>
                                            </Tooltip>
                                          }
                                        >
                                          <FormControl
                                            type="number"
                                            // max="-0.000000001"
                                            step={1}
                                            precision={0}
                                            //mobile={true}
                                            value={+c}
                                            onChange={(e) => setc(e.target.value)}
                                            placeholder="0"
                                          />
                                        </OverlayTrigger>
                                      </InputGroup>
                                    </Col>

                                    <Col></Col>
                                  </Row>
                                  <br></br>
                                  <div class="card">
                                    <div
                                      class={+pv2 > significancelevel ? 'card-body bg-success' : 'card-body bg-danger'}
                                    >
                                      <p class="card-text text-white">
                                        <h5>
                                          Hypotesetest &mu; med to-sidet alternativ hypotese{' '}
                                          <OverlayTrigger
                                            placement="auto"
                                            overlay={
                                              <Tooltip>
                                                <p style={{ textAlign: 'left' }}>
                                                  Vi benytter hypotesetest med to-sidet alternativ hypotese H
                                                  <sub>1</sub>, når vi kan ende med at forkaste nulhypotesen H
                                                  <sub>0</sub> af 2 årsager, hvis gennemsnittet i stikprøven er
                                                  signifikant mindre end eller signifikant større end {numberFormat4(c)}
                                                  .
                                                  <br />
                                                  Vi benytter dette test, hvis vi skal teste:<br></br>
                                                  Er middelværdien &mu; lig med dvs. = {numberFormat4(c)}
                                                  <br></br>
                                                  Er middelværdien &mu; forskellig fra dvs. ≠ {numberFormat4(c)}
                                                  <br></br>
                                                </p>
                                              </Tooltip>
                                            }
                                          >
                                            <i class="fas fa-question-circle"></i>
                                          </OverlayTrigger>
                                        </h5>
                                        <hr></hr>H<sub>0</sub>: &mu; = {numberFormat4(c)}
                                        <br></br>H<sub>1</sub>: &mu; ≠ {numberFormat4(c)}
                                        <br></br>
                                        {+pv2 > significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * pv2)}% er
                                            større end 5% signifikansniveauet, kan vi ikke afvise nulhypotesen H
                                            <sub>0</sub>.<br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>0</sub>: &mu; = {numberFormat4(c)} dvs. middelværdien i populationen er
                                            lig med {numberFormat4(c)}
                                            <br></br>
                                            <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake />{' '}
                                            <s>
                                              H<sub>1</sub>: &mu; ≠ {numberFormat4(c)} dvs. middelværdien i populationen
                                              er forskellig fra {numberFormat4(c)}
                                            </s>
                                            <br></br>
                                            Vi kan således ikke afvise at den sande middelværdi i populationen &mu; er{' '}
                                            {numberFormat4(c)}
                                            %.
                                          </p>
                                        )}
                                        {+pv2 <= significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * pv2)}% er
                                            mindre end 5% signifikansniveauet, kan vi afvise H<sub>0</sub>.<br></br>
                                            <s>
                                              <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake /> H
                                              <sub>0</sub>: &mu; = {numberFormat4(c)} dvs. middelværdien i populationen
                                              er lig med {numberFormat4(c)}%
                                            </s>
                                            <br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>1</sub>: &mu; ≠ {numberFormat4(c)} dvs. middelværdien &mu; i
                                            populationen er forskellig fra {numberFormat4(c)}
                                            <br></br>
                                            Vi afviser derfor at den sande middelværdi i populationen &mu; er{' '}
                                            {numberFormat4(c)}
                                            %.
                                            <br></br>
                                            Der er statistisk belæg, for at konkludere at middelværdien i populationen
                                            &mu; er forskellig fra {numberFormat4(c)}
                                            %.
                                          </p>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <br></br>
                                  <div class="card">
                                    <div
                                      class={
                                        +pv1op > significancelevel ? 'card-body bg-success' : 'card-body bg-danger'
                                      }
                                    >
                                      <p class="card-text text-white">
                                        <h5>
                                          Hypotesetest &mu; med 1-sidet alternativ hypotese opad{' '}
                                          <OverlayTrigger
                                            placement="auto"
                                            overlay={
                                              <Tooltip>
                                                <p style={{ textAlign: 'left' }}>
                                                  Vi benytter hypotesetest med 1-sidet alternativ hypotese H<sub>1</sub>{' '}
                                                  opad, når vi kan ende med at forkaste nulhypotesen H<sub>0</sub> af 1
                                                  årsag, hvis gennemsnittet i stikprøven er signifikant større end {c}
                                                  <br />
                                                  Vi benytter dette test, hvis vi skal teste:<br></br>
                                                  Er middelværdien højst eller maksimalt dvs. ≤ {c}
                                                  <br></br>
                                                  Er middelværdien større end dvs. &gt; {c}
                                                </p>
                                              </Tooltip>
                                            }
                                          >
                                            <i class="fas fa-question-circle"></i>
                                          </OverlayTrigger>
                                        </h5>
                                        <hr></hr>H<sub>0</sub>: &mu; ≤ {numberFormat4(c)}
                                        <br></br>H<sub>1</sub>: &mu; &gt; {numberFormat4(c)}
                                        <br></br>
                                        {+pv1op > significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * pv1op)}% er
                                            større end 5% signifikansniveauet, kan vi ikke afvise nulhypotesen H
                                            <sub>0</sub>.<br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>0</sub>: &mu; ≤ {numberFormat4(c)} dvs. middelværdien i populationen
                                            &mu; højst er {numberFormat4(c)}
                                            <br></br>
                                            <s>
                                              <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake /> H
                                              <sub>1</sub>: &mu; &gt; {numberFormat4(c)} dvs. middelværdien i
                                              populationen &mu; er større end {numberFormat4(c)}.
                                            </s>
                                            <br></br>
                                            Vi kan således ikke afvise at den sande middelværdi i populationen &mu;
                                            højst er {numberFormat4(c)}.
                                          </p>
                                        )}
                                        {+pv1op <= significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * pv1op)}% er
                                            mindre end 5% signifikansniveauet, kan vi afvise H<sub>0</sub>.<br></br>
                                            <s>
                                              <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake /> H
                                              <sub>0</sub>: &mu; ≤ {numberFormat4(c)} dvs. middelværdien i populationen
                                              &mu; højst er {numberFormat4(c)}.
                                            </s>
                                            <br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>1</sub>: &mu; &gt; {numberFormat4(c)} dvs. middelværdien i populationen
                                            &mu; er større end {numberFormat4(c)}
                                            <br></br>
                                            Vi afviser derfor at den sande middelværdi i populationen &mu; højst er{' '}
                                            {numberFormat4(c)}.<br></br>
                                            Der er statistisk belæg, for at konkludere at middelværdien i populationen
                                            &mu; er større en {numberFormat4(c)}.
                                          </p>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <br></br>
                                  <div class="card">
                                    <div
                                      class={
                                        +pv1ned > significancelevel ? 'card-body bg-success' : 'card-body bg-danger'
                                      }
                                    >
                                      <p class="card-text text-white">
                                        <h5>
                                          Hypotesetest &mu; med 1-sidet alternativ hypotese nedad{' '}
                                          <OverlayTrigger
                                            placement="auto"
                                            overlay={
                                              <Tooltip>
                                                <p style={{ textAlign: 'left' }}>
                                                  Vi benytter hypotesetest med 1-sidet alternativ hypotese H<sub>1</sub>{' '}
                                                  nedad, når vi kan ende med at forkaste nulhypotesen H<sub>0</sub> af 1
                                                  årsag, hvis gennemsnittet i stikprøven er signifikant større end{' '}
                                                  {numberFormat4(c)}
                                                  <br />
                                                  Vi benytter dette test, hvis vi skal teste:<br></br>
                                                  Er middelværdien &mu; mindst eller minimum dvs. ≥ {numberFormat4(c)}
                                                  <br></br>
                                                  Er middelværdien &mu; mindre end dvs. &lt; {numberFormat4(c)}
                                                </p>
                                              </Tooltip>
                                            }
                                          >
                                            <i class="fas fa-question-circle"></i>
                                          </OverlayTrigger>
                                        </h5>
                                        <hr></hr>H<sub>0</sub>: &mu; ≥ {numberFormat4(c)}
                                        <br></br>H<sub>1</sub>: &mu; &lt; {numberFormat4(c)}
                                        <br></br>
                                        {+pv1ned > significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * pv1ned)}% er
                                            større end 5% signifikansniveauet, kan vi ikke afvise nulhypotesen H
                                            <sub>0</sub>.<br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>0</sub>: &mu; ≥ {numberFormat4(c)} dvs. middelværdien i populationen
                                            &mu; mindst er {numberFormat4(c)}
                                            <br></br>
                                            <s>
                                              <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake /> H
                                              <sub>1</sub>: &mu; &lt; {numberFormat4(c)} dvs. middelværdien i
                                              populationen p er mindre end {numberFormat4(c)}
                                            </s>
                                            <br></br>
                                            <br></br>
                                            Vi kan således ikke afvise at den sande middelværdi i populationen &mu;
                                            mindst er {numberFormat4(c)}.
                                          </p>
                                        )}
                                        {+pv1ned <= significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * pv1ned)}% er
                                            mindre end 5% signifikansniveauet, kan vi afvise H<sub>0</sub>.<br></br>
                                            <s>
                                              <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake /> H
                                              <sub>0</sub>: &mu; ≥ {numberFormat4(c)} dvs. middelværdien i populationen
                                              &mu; mindst er {numberFormat4(c)}
                                            </s>
                                            <br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>1</sub>: &mu; &lt; {numberFormat4(c)} dvs. middelværdien i populationen
                                            &mu; er mindre end {numberFormat4(c)}
                                            <br></br>
                                            <br></br>
                                            Vi afviser derfor at den sande middelværdi i populationen &mu; mindst er{' '}
                                            {numberFormat4(c)}.<br></br>
                                            Der er statistisk belæg, for at konkludere at middelværdien i populationen
                                            &mu; er mindre end {numberFormat4(c)}.
                                          </p>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                    {/* ########################################################################################################################################################################################## */}
                    {/* Hypoteser standardafvigelse*/}
                    <Row>
                      <Col class="col-6">
                        <Button variant={colordummy8} size="sm" onClick={() => setShow8(!show8)}>
                          {show8 && (
                            <span>
                              Skjul test standardafvigelse <span style={{ textTransform: 'none' }}>&sigma;</span>
                            </span>
                          )}
                          {!show8 && (
                            <span>
                              Test standardafvigelse <span style={{ textTransform: 'none' }}> &sigma;</span>
                            </span>
                          )}
                        </Button>

                        <div>
                          {show8 && (
                            <div>
                              <br></br>
                              <div class="card">
                                <div class="card-body">
                                  <Row>
                                    {/*  test standardafvigelsen knap########################################################################################################################################################################################################################### */}
                                    <Col>
                                      <Form.Text className="text-muted">Test af standardafvigelsen &sigma;</Form.Text>
                                      <InputGroup size="sm">
                                        <OverlayTrigger
                                          placement="auto"
                                          delay={{
                                            show: 100,
                                            hide: 100,
                                          }}
                                          overlay={
                                            <Tooltip>
                                              <MathJax>
                                                Man kan ved tests sammenligne en standardafvigelse under en nulhypotese{' '}
                                                <span>{`$\\sigma$ = ${e}`}</span> med standardafvigelsen fra stikprøven{' '}
                                                {std}.
                                              </MathJax>
                                            </Tooltip>
                                          }
                                        >
                                          <FormControl
                                            type="number"
                                            // max="-0.000000001"
                                            step={1}
                                            precision={0}
                                            //mobile={true}
                                            value={+e}
                                            onChange={(e) => sete(e.target.value)}
                                            placeholder="0"
                                          />
                                        </OverlayTrigger>
                                      </InputGroup>
                                    </Col>
                                    <Col></Col>
                                  </Row>
                                  <br></br>

                                  <div class="card">
                                    <div
                                      class={
                                        +chipv2 > significancelevel ? 'card-body bg-success' : 'card-body bg-danger'
                                      }
                                    >
                                      <p class="card-text text-white">
                                        <h5>
                                          Hypotesetest &sigma; med to-sidet alternativ hypotese{' '}
                                          <OverlayTrigger
                                            placement="auto"
                                            overlay={
                                              <Tooltip>
                                                <p style={{ textAlign: 'left' }}>
                                                  Vi benytter hypotesetest med to-sidet alternativ hypotese H
                                                  <sub>1</sub>, når vi kan ende med at forkaste nulhypotesen H
                                                  <sub>0</sub> af 2 årsager, hvis standardafvigelsen i stikprøven her{' '}
                                                  {numberFormat4(std)} er signifikant mindre end eller signifikant
                                                  større end {numberFormat4(e)}.
                                                  <br />
                                                  Vi benytter dette test, hvis vi skal teste:<br></br>
                                                  Er standardafvigelsen &sigma; lig med dvs. = {numberFormat4(e)}
                                                  <br></br>
                                                  Er standardafvigelsen &sigma; forskellig fra dvs. ≠ {numberFormat4(e)}
                                                  <br></br>
                                                </p>
                                              </Tooltip>
                                            }
                                          >
                                            <i class="fas fa-question-circle"></i>
                                          </OverlayTrigger>
                                        </h5>
                                        <hr></hr>H<sub>0</sub>: &sigma; = {numberFormat4(e)}
                                        <br></br>H<sub>1</sub>: &sigma; ≠ {numberFormat4(e)}
                                        <br></br>
                                        {+chipv2 > significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * chipv2)}% er
                                            større end 5% signifikansniveauet, kan vi ikke afvise nulhypotesen H
                                            <sub>0</sub>.<br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>0</sub>: &sigma; = {numberFormat4(e)} dvs. standardafvigelsen i
                                            populationen er lig med {numberFormat4(e)}
                                            <br></br>
                                            <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake />{' '}
                                            <s>
                                              H<sub>1</sub>: &sigma; ≠ {numberFormat4(e)} dvs. standardafvigelsen i
                                              populationen er forskellig fra {numberFormat4(e)}
                                            </s>
                                            <br></br>
                                            Vi kan således ikke afvise at den sande standardafvigelse i populationen
                                            &sigma; er {numberFormat4(e)}.
                                          </p>
                                        )}
                                        {+chipv2 <= significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * chipv2)}% er
                                            mindre end 5% signifikansniveauet, kan vi afvise H<sub>0</sub>.<br></br>
                                            <s>
                                              <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake /> H
                                              <sub>0</sub>: &sigma; = {numberFormat4(e)} dvs. standardafvigelsen i
                                              populationen er lig med {numberFormat4(e)}
                                            </s>
                                            <br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>1</sub>: &sigma; ≠ {numberFormat4(e)} dvs. standardafvigelsen &sigma; i
                                            populationen er forskellig fra {numberFormat4(e)}
                                            <br></br>
                                            Vi afviser derfor at den sande standardafvigelse i populationen &sigma; er{' '}
                                            {numberFormat4(e)}.<br></br>
                                            Der er statistisk belæg, for at konkludere at standardafvigelsen i
                                            populationen &sigma; er forskellig fra {numberFormat4(e)}.
                                          </p>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <br></br>
                                  <div class="card">
                                    <div
                                      class={
                                        +chipvop > significancelevel ? 'card-body bg-success' : 'card-body bg-danger'
                                      }
                                    >
                                      <p class="card-text text-white">
                                        <h5>
                                          Hypotesetest &sigma; med 1-sidet alternativ hypotese opad{' '}
                                          <OverlayTrigger
                                            placement="auto"
                                            overlay={
                                              <Tooltip>
                                                <p style={{ textAlign: 'left' }}>
                                                  Vi benytter hypotesetest med 1-sidet alternativ hypotese H<sub>1</sub>{' '}
                                                  opad, når vi kan ende med at forkaste nulhypotesen H<sub>0</sub> af 1
                                                  årsag, hvis gennemsnittet i stikprøven er signifikant større end {e}
                                                  <br />
                                                  Vi benytter dette test, hvis vi skal teste:<br></br>
                                                  Er standardafvigelsen højst eller maksimalt dvs. ≤ {c}
                                                  <br></br>
                                                  Er standardafvigelsen større end dvs. &gt; {c}
                                                </p>
                                              </Tooltip>
                                            }
                                          >
                                            <i class="fas fa-question-circle"></i>
                                          </OverlayTrigger>
                                        </h5>
                                        <hr></hr>H<sub>0</sub>: &sigma; ≤ {numberFormat4(e)}
                                        <br></br>H<sub>1</sub>: &sigma; &gt; {numberFormat4(e)}
                                        <br></br>
                                        {+chipvop > significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * chipvop)}% er
                                            større end 5% signifikansniveauet, kan vi ikke afvise nulhypotesen H
                                            <sub>0</sub>.<br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>0</sub>: &sigma; ≤ {numberFormat4(e)} dvs. standardafvigelsen i
                                            populationen &sigma; højst er {numberFormat4(e)}
                                            <br></br>
                                            <s>
                                              <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake /> H
                                              <sub>1</sub>: &sigma; &gt; {numberFormat4(e)} dvs. standardafvigelsen i
                                              populationen &sigma; er større end {numberFormat4(e)}.
                                            </s>
                                            <br></br>
                                            Vi kan således ikke afvise at den sande standardafvigelse i populationen
                                            &sigma; højst er {numberFormat4(e)}.
                                          </p>
                                        )}
                                        {+chipvop <= significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * chipvop)}% er
                                            mindre end 5% signifikansniveauet, kan vi afvise H<sub>0</sub>.<br></br>
                                            <s>
                                              <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake /> H
                                              <sub>0</sub>: &sigma; ≤ {numberFormat4(e)} dvs. standardafvigelsen i
                                              populationen &sigma; højst er {numberFormat4(e)}.
                                            </s>
                                            <br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>1</sub>: &sigma; &gt; {numberFormat4(e)} dvs. standardafvigelsen i
                                            populationen &sigma; er større end {numberFormat4(e)}
                                            <br></br>
                                            Vi afviser derfor at den sande standardafvigelse i populationen &sigma;
                                            højst er {numberFormat4(e)}.<br></br>
                                            Der er statistisk belæg, for at konkludere at standardafvigelsen i
                                            populationen &sigma; er større en {numberFormat4(e)}.
                                          </p>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <br></br>
                                  <div class="card">
                                    <div
                                      class={
                                        +chipvned > significancelevel ? 'card-body bg-success' : 'card-body bg-danger'
                                      }
                                    >
                                      <p class="card-text text-white">
                                        <h5>
                                          Hypotesetest &sigma; med 1-sidet alternativ hypotese nedad{' '}
                                          <OverlayTrigger
                                            placement="auto"
                                            overlay={
                                              <Tooltip>
                                                <p style={{ textAlign: 'left' }}>
                                                  Vi benytter hypotesetest med 1-sidet alternativ hypotese H<sub>1</sub>{' '}
                                                  nedad, når vi kan ende med at forkaste nulhypotesen H<sub>0</sub> af 1
                                                  årsag, hvis gennemsnittet i stikprøven er signifikant større end{' '}
                                                  {numberFormat4(e)}
                                                  <br />
                                                  Vi benytter dette test, hvis vi skal teste:<br></br>
                                                  Er standardafvigelsen &sigma; mindst eller minimum dvs. ≥{' '}
                                                  {numberFormat4(e)}
                                                  <br></br>
                                                  Er standardafvigelsen &sigma; mindre end dvs. &lt; {numberFormat4(e)}
                                                </p>
                                              </Tooltip>
                                            }
                                          >
                                            <i class="fas fa-question-circle"></i>
                                          </OverlayTrigger>
                                        </h5>
                                        <hr></hr>H<sub>0</sub>: &sigma; ≥ {numberFormat4(e)}
                                        <br></br>H<sub>1</sub>: &sigma; &lt; {numberFormat4(e)}
                                        <br></br>
                                        {+chipvned > significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * chipvned)}% er
                                            større end 5% signifikansniveauet, kan vi ikke afvise nulhypotesen H
                                            <sub>0</sub>.<br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>0</sub>: &sigma; ≥ {numberFormat4(e)} dvs. standardafvigelsen i
                                            populationen &sigma; mindst er {numberFormat4(e)}
                                            <br></br>
                                            <s>
                                              <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake /> H
                                              <sub>1</sub>: &sigma; &lt; {numberFormat4(e)} dvs. standardafvigelsen i
                                              populationen p er mindre end {numberFormat4(e)}
                                            </s>
                                            <br></br>
                                            <br></br>
                                            Vi kan således ikke afvise at den sande standardafvigelse i populationen
                                            &sigma; mindst er {numberFormat4(e)}.
                                          </p>
                                        )}
                                        {+chipvned <= significancelevel && (
                                          <p>
                                            Da p-værdien/signifikanssandsynligheden {numberFormat4(100 * chipvned)}% er
                                            mindre end 5% signifikansniveauet, kan vi afvise H<sub>0</sub>.<br></br>
                                            <s>
                                              <FontAwesomeIcon icon={faXmarkCircle} size="1x" color="white" shake /> H
                                              <sub>0</sub>: &sigma; ≥ {numberFormat4(e)} dvs. standardafvigelsen i
                                              populationen &sigma; mindst er {numberFormat4(e)}
                                            </s>
                                            <br></br>
                                            <FontAwesomeIcon icon={faCheckCircle} size="1x" color="white" beat /> H
                                            <sub>1</sub>: &sigma; &lt; {numberFormat4(e)} dvs. standardafvigelsen i
                                            populationen &sigma; er mindre end {numberFormat4(e)}
                                            <br></br>
                                            <br></br>
                                            Vi afviser derfor at den sande standardafvigelse i populationen &sigma;
                                            mindst er {numberFormat4(e)}.<br></br>
                                            Der er statistisk belæg, for at konkludere at standardafvigelsen i
                                            populationen &sigma; er mindre end {numberFormat4(e)}.
                                          </p>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                    <hr></hr>
                    {/* HR---------------------------------------------------------------------------------------------------------------- */}
                    {/* ########################################################################################################################################################################################## */}
                    {/* Formler og figurer */}
                    <Row>
                      <Col class="col-6">
                        <Button variant={colordummy5} size="sm" onClick={() => setShow5(!show5)}>
                          {show5 && 'Skjul Formler og figurer'}
                          {!show5 && 'Formler og figurer'}
                        </Button>
                        <div>
                          {show5 && (
                            <div>
                              <div>
                                <br></br>
                                <div class="card">
                                  <div class="card-body">
                                    <div>
                                      <p class="card-text">
                                        <>
                                          <small>
                                            <Row>
                                              <Col>
                                                <div>
                                                  <div>
                                                    <div>
                                                      <MathJax dynamic>
                                                        Punktestimatet for middelværdien er udregnet til:
                                                        <span>{`$$\\bar{x} = \\hat{\\mu} = ${numberFormat4(
                                                          a
                                                        )}$$`}</span>
                                                        <hr></hr>
                                                        {(1 - significancelevel) * 100}% konfidensintervallet kan
                                                        udregnes ved nedenstående formel:
                                                        <span>
                                                          {
                                                            '$$ \\hat{\\mu} \\pm t_{1-\\frac{\\alpha}{2},n-1}\\cdot \\frac{\\hat{\\sigma}}{\\sqrt{n}} \\approx $$'
                                                          }
                                                        </span>
                                                        <span>
                                                          Hvor {`$\\alpha$`} er {numberFormat4(significancelevel)}=
                                                          {numberFormat4(significancelevel * 100)}% signifikansniveauet.
                                                          <br></br>
                                                          Hvor{' '}
                                                          {`$t_{1-\\frac{\\alpha}{2},n-1}=t_{1-\\frac{${significancelevel}}{2},${b}-1}=t_{1-${
                                                            significancelevel / 2
                                                          } ${b - 1}}=t_{${1 - significancelevel / 2}, ${
                                                            b - 1
                                                          }}=$`}{' '}
                                                          {numberFormat4(q2)} er {100 * (1 - significancelevel / 2)}%
                                                          fraktilen for t-fordelingen med n-1 = {b - 1} frihedsgrader.
                                                          <br></br>
                                                          Hvor
                                                          {`$ \\frac{\\hat{\\sigma}}{\\sqrt{n}} \\approx \\frac{${std}}{\\sqrt{${b}}} $`}{' '}
                                                          er standardfejlen for middelværdien ofte kaldet SE eller SEM.
                                                        </span>
                                                        <span>{`$$ ${numberFormat4(a)} \\pm ${numberFormat4(
                                                          q2
                                                        )} \\cdot \\frac{${std}}{\\sqrt{${b}}} \\approx $$`}</span>
                                                        <span>{`$$[ ${numberFormat4(lower)};${numberFormat4(
                                                          upper
                                                        )}]$$`}</span>
                                                        Vi kan med {(1 - significancelevel) * 100}% sandsynlighed sige
                                                        at middelværdien i populationen ligger mellem{' '}
                                                        {numberFormat4(lower)} og {numberFormat4(upper)}
                                                        <hr></hr>
                                                        Fejlmarginen er den halve længde af konfidensintervallet dvs.
                                                        øvre minus nedre grænse for konfidensintervallet divideret med
                                                        2, denne kan udregnes som halvdelen af konfidensintervallet:
                                                        <span>
                                                          {`$$ \\frac{${numberFormat4(upper)}-${numberFormat4(
                                                            lower
                                                          )}}{2}\\approx${numberFormat4((upper - lower) / 2)} $$`}
                                                        </span>
                                                        <hr></hr>
                                                        Hvis vi ikke kan afvise nulhypotesen, betyder det at den sande
                                                        populations parameter {`$\\mu=\\mu_{0}$`}. Så gælder fra CLT, at
                                                        stikprøvefordelingen er normalfordelt med middelværdi{' '}
                                                        {`$\\mu=\\mu_{0}$`}. Hvor {`$\\mu_{0}=${c}$`} er den middelværdi
                                                        vi tester under nulhypotesen {`$H_{0}$`}.<br></br>
                                                        t-teststørrelsen angiver forskellen mellem {`$\\hat{\\mu}$`} og{' '}
                                                        {`$\\mu_{0}$`}, divideret med SEM standardfejlen for
                                                        middelværdien{' '}
                                                        <span>{`$ \\frac{\\hat{\\sigma}}{\\sqrt{n}} = \\frac{${std}}{\\sqrt{${b}}} \\approx {${numberFormat4(
                                                          stdev
                                                        )}} $`}</span>
                                                        :
                                                        <span>{`$$t-teststørrelsen = \\frac{\\hat{\\mu}-\\mu_{0}}{SEM} \\approx \\frac{${numberFormat4(
                                                          a
                                                        )}-${c}}{${numberFormat4(stdev)}} \\approx ${numberFormat4(
                                                          (a - c) / stdev
                                                        )} $$`}</span>
                                                      </MathJax>
                                                    </div>
                                                  </div>
                                                </div>
                                              </Col>
                                            </Row>
                                            <hr></hr>

                                            <HighchartsReact highcharts={Highcharts} options={options2} />
                                            <HighchartsReact highcharts={Highcharts} options={optionsop} />
                                            <HighchartsReact highcharts={Highcharts} options={optionsned} />
                                          </small>
                                        </>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <br></br>
                              </div>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                    {/* Fejlmargin########################################################################################################################################################################################## */}
                    {/* Fejlmargin */}
                    <Row>
                      <Col class="col-6">
                        <Button variant={colordummy7} size="sm" onClick={() => setShow7(!show7)}>
                          {show7 && 'Skjul fejlmargin'}
                          {!show7 && 'sæt ønsket fejlmargin'}
                        </Button>
                        <div>
                          {show7 && (
                            <div>
                              <br></br>
                              <div class="card">
                                <div class="card-body">
                                  <div>
                                    <Form.Text className="text-muted">Ønsket fejlmargin</Form.Text>
                                    {/* <Col class="col-6"> */}
                                    <InputGroup size="sm">
                                      <OverlayTrigger
                                        placement="top"
                                        delay={{
                                          show: 100,
                                          hide: 100,
                                        }}
                                        overlay={
                                          <Tooltip>
                                            Den nuværende fejlmargin er {numberFormat4(fejlmargin)}, den ønskede
                                            fejlmargin er {d}
                                          </Tooltip>
                                        }
                                      >
                                        <FormControl
                                          type="number"
                                          min="0.00000000"
                                          step={1}
                                          precision={0}
                                          //mobile={true}
                                          value={+d}
                                          onChange={(e) => setd(e.target.value)}
                                          placeholder="0"
                                        />
                                      </OverlayTrigger>
                                      {/* InputGroup.Append not working in react 18 */}
                                      {/* <InputGroup.Append>
                                      <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                                    </InputGroup.Append> */}
                                    </InputGroup>

                                    <hr></hr>
                                  </div>
                                  <p class="card-text">
                                    Man skal mindst have en{' '}
                                    <span style={{ backgroundColor: '#80ff00' }}>
                                      stikprøvestørrelse på {Math.ceil(minsample)}
                                    </span>
                                    , hvis man ønsker en fejlmargin på {d}.
                                    {+d < +fejlmargin && (
                                      <span>
                                        <br></br>Da den nuværende fejlmargin på {numberFormat4(fejlmargin)} er større
                                        end {d}, skal man have en stikprøve størrelse på mindst {Math.ceil(minsample)}{' '}
                                        for at opnå fejlmarginen på kun {d}.
                                      </span>
                                    )}
                                    {+fejlmargin < +d && (
                                      <span>
                                        <br></br>Da den nuværende fejlmargin på {numberFormat4(fejlmargin)} er mindre
                                        end {d}, kunne man have begrænset stikprøve størrelsen til{' '}
                                        {Math.ceil(minsample)} for at opnå fejlmarginen på {d}.
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <br></br>
                            </div>
                          )}
                        </div>

                        {/* </InputGroup> */}
                      </Col>
                      {/* <Col class="col-6"></Col> */}
                    </Row>
                    {/* FPC########################################################################################################################################################################################## */}
                    <Row>
                      <Col class="col-6">
                        <div>
                          <button type="button" class={colordummyfpc} onClick={toggleDisplay}>
                            {fpctext}
                          </button>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      {fpctext === 'Fjern kendt endelig populationsstørrelse' && (
                        <div>
                          <br></br>
                          <Col>
                            <div class="card">
                              <div class="card-body">
                                <p class="lead text-muted">Populationsstørrelse</p>
                                <>
                                  <InputGroup size="sm" class="col-xs-3">
                                    <FormControl
                                      type="number"
                                      // max="-0.000000001"
                                      step={1}
                                      precision={0}
                                      //mobile={true}
                                      value={+f}
                                      onChange={(e) => setf(e.target.value)}
                                      placeholder="0"
                                    />
                                  </InputGroup>
                                  <hr></hr>
                                  <p class="card-text">
                                    Har man som her en endelig kendt populationstørrelse på {f}, bliver
                                    konfidensinterval og stikprøvestørrelse påvirket en smule. Er populationen af en vis
                                    størrelse, vil dette kun ses på yderlige decimaler, der skal således være tale om
                                    relativt små populationer, for at dette har en betydning. Vi sætter kun denne værdi
                                    hvis vi kender den endelige populationsstørrelse.
                                  </p>
                                </>
                              </div>
                            </div>
                            <br></br>
                          </Col>
                        </div>
                      )}
                    </Row>
                  </Form>
                </div>
              </Container>
            </div>
          </div>
        </Container>
      </MathJaxContext>
    </>
  );
}
