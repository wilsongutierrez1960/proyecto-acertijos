
# QUARTERLY PROJECTION MODEL (QPM) - KNOWLEDGE BASE FOR EMBEDDINGS
# IMF Standard Framework for Monetary Policy Analysis
# =============================================================================

## 1. INTRODUCTION AND OVERVIEW

### 1.1 What is the QPM?
The Quarterly Projection Model (QPM) is one of the IMF's standard frameworks for monetary policy analysis and forms a core component of a forward-looking Forecasting and Policy Analysis System (FPAS). It is a semi-structural New Keynesian gap model designed to support central banks in conducting monetary policy analysis and forecasting.

The QPM was developed by Berg, Karam, and Laxton (2006) as a practical model-based approach to monetary policy analysis. It has since become a workhorse model used extensively by central banks and IMF country desk officers.

### 1.2 Key Characteristics of the QPM
- Semi-structural: equations have economic interpretations with parameters set outside the model
- New Keynesian: incorporates real and nominal rigidities
- Gap model: estimates gaps in output, inflation, real interest rate, and real exchange rate
- Forward-looking: includes rational expectations
- Monetary policy neutrality in the long run
- Small open economy framework
- Linked to quarterly data

### 1.3 Role in FPAS
The QPM serves as the core analytical tool within the Forecasting and Policy Analysis System (FPAS), which supports central banks in:
- Making monetary policy decisions in a systematic, forward-looking fashion
- Informing policy decisions with economic data and analysis
- Communicating policy decisions transparently
- Providing a framework for policy discussion and scenario analysis

## 2. THEORETICAL FOUNDATIONS

### 2.1 New Keynesian Core
The QPM is built on New Keynesian foundations where:
- Nominal prices are sticky (price rigidities)
- Output is demand-determined in the short run
- Monetary policy is non-neutral in the short run but neutral in the long run
- Forward-looking behavior of economic agents
- Rational expectations play a key role

### 2.2 Gap Approach
The model separates variables into:
- Trend components (long-run equilibrium): potential output, equilibrium real exchange rate, neutral real interest rate
- Gap components (cyclical deviations): output gap, inflation gap, real interest rate gap, real exchange rate gap
- Super-neutrality: no long-run trade-off between output and inflation

### 2.3 Small Open Economy Assumptions
- Domestic economy does not affect the rest of the world
- External variables (foreign inflation, output gap, interest rates) are exogenous
- Exchange rate dynamics follow Uncovered Interest Parity (UIP)
- International trade and capital flows affect domestic economy

## 3. CORE MODEL STRUCTURE - FOUR KEY EQUATIONS

### 3.1 Aggregate Demand (IS Curve)
The output gap is modeled as a function of:
- Past output gap (persistence): y_hat_t-1
- Expected future output gap: E_t[y_hat_t+1]
- Real monetary conditions index (rmci): weighted average of real interest rate gap and real exchange rate gap
- Foreign output gap: y_hat_t_star
- Aggregate demand shock: epsilon_y

Equation form:
y_hat_t = a1*y_hat_t-1 + a2*E_t[y_hat_t+1] - a3*rmci_t + a4*y_hat_t_star + epsilon_y

Where rmci_t = a5*r_hat_t + (1-a5)*(-z_hat_t)

Key parameters to calibrate: a1, a2, a3, a4, a5

### 3.2 Aggregate Supply (Phillips Curve)
Inflation dynamics follow a forward-looking open-economy Phillips curve:
- Past inflation (inertia): pi_t-1
- Expected future inflation: E_t[pi_t+1]
- Real marginal costs (rmc): weighted average of output gap and real exchange rate gap
- Cost-push shocks: epsilon_pi

Equation form:
pi_t = b1*pi_t-1 + (1-b1)*E_t[pi_t+1] + b2*rmc_t + epsilon_pi

Where rmc_t = phi*y_hat_t + (1-phi)*z_hat_t

Key parameters to calibrate: b1, b2, phi

### 3.3 Uncovered Interest Parity (UIP)
Exchange rate dynamics are modeled via UIP:
- Current exchange rate equals expected exchange rate adjusted for interest rate differential
- Risk premium component
- Exchange rate expectations can be hybrid (forward-looking + backward-looking)

Equation form:
s_t = s_t^e + (i_t_star - i_t + prem_t)/4 + epsilon_s

Where s_t^e = c1*E_t[s_t+1] + (1-c1)*(s_t-1 + (2/4)*delta_s_bar_t)

Key parameters to calibrate: c1 (degree of exchange rate flexibility)

### 3.4 Monetary Policy Reaction Function (Taylor-type Rule)
The central bank sets interest rates based on:
- Interest rate smoothing (persistence): i_t-1
- Neutral real rate plus expected inflation
- Inflation gap (deviation from target)
- Output gap
- Monetary policy shock

Equation form:
i_t = gamma1*i_t-1 + (1-gamma1)*[E_t[pi_t+1] + r_bar_t + gamma2*(E_t[pi_t+3] - pi_bar_t) + gamma3*y_hat_t] + epsilon_i

Key parameters to calibrate: gamma1 (smoothing), gamma2 (inflation weight), gamma3 (output weight)

## 4. EXTENDED MODEL COMPONENTS

### 4.1 Sectoral Decomposition
Extended QPMs may include:
- Agriculture sector output gap
- Oil/commodity sector output gap
- Non-agriculture non-oil (NANO) output gap
- Food inflation Phillips curve
- Core inflation Phillips curve
- Sectoral weights in CPI basket

### 4.2 Fiscal Block
- Structural vs. cyclical primary deficit decomposition
- Fiscal impulse effects on aggregate demand
- AR(1) process for structural deficit
- Counter-cyclical fiscal policy parameters

### 4.3 External Sector
- Foreign variables as exogenous (US/euro area data)
- World commodity prices (oil, food)
- Sovereign risk premium modeling
- Current account dynamics

### 4.4 Financial Sector Extensions
- Credit risk premium
- Monetary policy transmission spread (interbank vs. policy rate)
- Financial frictions
- Dollarization effects

## 5. DATA AND TREND ANALYSIS (MODULE M4)

### 5.1 Data Requirements
Key data series needed:
- Real GDP (quarterly, seasonally adjusted)
- Consumer Price Index (CPI) and components (core, food, energy)
- Nominal policy interest rate
- Nominal exchange rate
- Foreign variables (US/euro area GDP, inflation, interest rates)
- World commodity prices (oil, food)
- Fiscal variables (deficit, debt)

### 5.2 Trend-Cycle Decomposition
Methods for separating trends from cycles:
- Hodrick-Prescott (HP) filter
- Kalman filter (multivariate method)
- Watson detrending (random walk with drift)
- Harvey-Clark detrending (local linear trend)
- Bandpass filter (frequency domain)

### 5.3 Seasonal Adjustment
- X12/X13-ARIMA routines
- Ensuring data is seasonally adjusted before analysis

### 5.4 Steady-State Values
Setting long-term parameters:
- Potential output growth rate
- Inflation target
- Equilibrium real exchange rate appreciation/depreciation
- Real neutral interest rate
- Foreign inflation target and neutral rate

## 6. KALMAN FILTER AND STATE-SPACE REPRESENTATION (MODULE M5)

### 6.1 State-Space Form
The QPM can be represented in state-space form:
- State variables (unobservable): output gap, inflation expectations, etc.
- Observable variables: actual GDP, CPI, interest rates, exchange rates
- Measurement equations: link observables to states
- Transition equations: describe state dynamics

### 6.2 Kalman Filter Applications
- Historical decomposition of shocks
- Filtering unobservable variables (gaps, expectations)
- Signal extraction from noisy data
- Real-time estimation of economic states

### 6.3 Historical Decomposition
Understanding factors shaping dynamics:
- Decomposition of inflation into: inflation expectations, past inflation persistence, output gap, exchange rate, shocks
- Decomposition of output gap into: demand shocks, monetary conditions, exchange rate, interest rate
- Decomposition of monetary conditions index

### 6.4 Shock Identification
- Structural shocks vs. reduced-form residuals
- Narrative approach to shock identification
- Pairing structural shocks with variables to be exogenized
- Expert judgment in shock identification

## 7. CALIBRATION (MODULE M6)

### 7.1 Calibration vs. Estimation
- Calibration favored over estimation due to practical constraints
- Data limitations in developing economies
- Short time series
- Regime changes affecting parameter stability
- Transparent integration of expert insights

### 7.2 Calibration Steps
1. Set steady-state values (potential growth, inflation target, neutral rates)
2. Set trend paths for key endogenous variables
3. Calibrate equation parameters to match stylized facts
4. Validate through impulse response analysis
5. Check in-sample simulations
6. Assess residuals for systematic biases

### 7.3 Parameter Validation
- Impulse response functions: verify theoretical consistency
- In-sample simulations: compare model predictions with actual data
- Out-of-sample forecasting: assess predictive accuracy
- Residual analysis: check for systematic patterns
- Moment matching: compare model moments with data moments

### 7.4 Key Calibration Targets
- Sacrifice ratio: cumulative output loss per percentage point of inflation reduction
- Monetary policy transmission lags
- Exchange rate pass-through
- Inflation persistence
- Output gap persistence
- Phillips curve slope

## 8. MODEL SOLUTION AND FORECASTING

### 8.1 Baseline Solution
- Solve model without shocks
- Generate unconditional forecasts
- Internalize main features of institutional setup
- Medium-term projections (typically 3-5 years)

### 8.2 Scenario Analysis
- Alternative scenarios with specific shocks
- Policy experiments (interest rate changes, fiscal measures)
- External shocks (commodity prices, foreign demand)
- Confidence shocks
- Compare baseline vs. alternative paths

### 8.3 Implementation Tools
- MATLAB/Octave with IRIS toolbox
- EViews with MCE solver
- Specialized macroeconomic modeling software
- Programming requirements: data transformation, filtration, model solution

## 9. MONETARY POLICY ANALYSIS APPLICATIONS

### 9.1 Policy Trade-offs
- Inflation vs. output stabilization
- Short-term costs vs. long-term benefits
- Sacrifice ratio analysis
- Optimal policy mix under different shocks

### 9.2 Shock Analysis
- Demand shocks: effects on output gap, inflation, exchange rate
- Supply shocks (cost-push): inflationary effects, policy response
- Exchange rate shocks: pass-through to inflation, output effects
- Monetary policy shocks: transmission mechanism
- External shocks: foreign demand, commodity prices

### 9.3 Policy Communication
- Unconditional forecasts as communication tool
- Scenario analysis for policy options
- Forward guidance implications
- Inflation targeting framework support

### 9.4 Special Topics
- Weather shocks and food inflation
- Climate change implications
- Financial stability considerations
- Dollarization effects
- Resource-rich economy extensions

## 10. MODEL VALIDATION AND PERFORMANCE

### 10.1 Validation Techniques
- Pseudo out-of-sample forecasts
- Comparison with benchmark models (SVAR, etc.)
- Moment comparison (data vs. model)
- Impulse response plausibility
- Forecast accuracy metrics

### 10.2 Performance Criteria
- Ability to reproduce observed data
- Theoretically consistent transmission channels
- Coherent policy narratives
- Robust out-of-sample forecasting record
- Well-identified historical business cycle dynamics

### 10.3 Limitations
- Linear model limitations (cumulative output effects)
- Reduced-form nature of some relationships
- Dependence on calibration quality
- Data quality and availability constraints
- Simplified financial sector representation

## 11. COUNTRY ADAPTATIONS AND EXTENSIONS

### 11.1 Inflation Targeting Regimes
- Flexible inflation targeting
- Point targets vs. target bands
- Forward-looking policy rules
- Communication strategies

### 11.2 Exchange Rate Regimes
- Floating exchange rates (canonical model)
- Fixed/pegged exchange rates
- Managed floats
- Currency unions (WAEMU, etc.)

### 11.3 Special Economic Structures
- Resource-rich economies (oil, minerals)
- Highly dollarized economies
- Agricultural-dependent economies
- Small island economies
- Post-conflict economies

### 11.4 Extensions Documented in Literature
- Fiscal sector integration
- Financial sector extensions
- Sectoral decompositions
- Climate shock modeling
- Weather shock extensions
- Multi-country/regional models

## 12. TECHNICAL IMPLEMENTATION DETAILS

### 12.1 Software Requirements
- MATLAB/Octave with IRIS toolbox
- EViews 14 (or EViews 13 with MCE package)
- Data processing capabilities
- Visualization tools

### 12.2 File Structure (EViews Example)
- 0_qpm.prg: driver program
- 1_makedata.prg: data preparation and initialization
- 2_definemodel.prg: model equation definition
- 3_solve_model.prg: model solution and scenarios
- 10_compare.prg: baseline vs. alternative comparison

### 12.3 Key Programming Tasks
- Data import and transformation
- Seasonal adjustment (X12/X13)
- Trend-cycle decomposition (HP filter, Kalman)
- Variable initialization (gaps, trends, steady states)
- Model equation specification
- Shock implementation
- Solution algorithms for rational expectations
- Output reporting and visualization

## 13. GLOSSARY OF KEY TERMS

- FPAS: Forecasting and Policy Analysis System
- QPM: Quarterly Projection Model
- IS Curve: Investment-Savings curve (aggregate demand)
- Phillips Curve: Aggregate supply/inflation dynamics
- UIP: Uncovered Interest Parity (exchange rate)
- Taylor Rule: Monetary policy reaction function
- Output Gap: Deviation of actual output from potential
- Inflation Gap: Deviation of inflation from target
- Real Exchange Rate Gap: Deviation from trend
- Real Interest Rate Gap: Deviation from neutral rate
- RMCI: Real Monetary Conditions Index
- RMC: Real Marginal Costs
- HP Filter: Hodrick-Prescott filter for trend extraction
- Kalman Filter: Optimal state estimation algorithm
- State-Space: Representation of dynamic system with observable and unobservable variables
- Structural Shock: Economically interpretable disturbance
- Reduced-Form Residual: Statistical error term
- Sacrifice Ratio: Output cost of disinflation
- Forward-Looking Expectations: Rational expectations of future variables
- Backward-Looking Expectations: Adaptive expectations based on past values
- Super-Neutrality: Long-run neutrality of monetary policy
- Potential Output: Maximum sustainable output level
- Neutral Rate: Real interest rate consistent with potential output
- Steady State: Long-run equilibrium values
